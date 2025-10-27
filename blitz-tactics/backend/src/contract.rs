use async_trait::async_trait;
use blitz_tactics::{GamePhase, GameState, Message, Operation, PlayerInGame};
use linera_sdk::{
    base::{AccountOwner, Amount, ChainId, Timestamp},
    Contract, ContractRuntime,
};

pub struct BlitzTacticsContract {
    state: blitz_tactics::state::BlitzTacticsState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(BlitzTacticsContract);

impl With<ContractRuntime<Self>> for BlitzTacticsContract {
    fn with(runtime: ContractRuntime<Self>) -> Self {
        let state = blitz_tactics::state::BlitzTacticsState::load(runtime.storage_context())
            .expect("Failed to load state");
        BlitzTacticsContract { state, runtime }
    }
}

#[async_trait]
impl Contract for BlitzTacticsContract {
    type Message = Message;
    type InstantiationArgument = ();
    type Parameters = ();

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        self.state.initialize_card_database().await.expect("Failed to initialize cards");
        self.state.total_games_played.set(0);
        self.state.next_match_id.set(1);
    }

    async fn execute_operation(&mut self, operation: Operation) -> Self::Response {
        match operation {
            Operation::CreatePlayerProfile => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                self.state
                    .create_player(owner)
                    .await
                    .expect("Failed to create player");

                vec![]
            }

            Operation::CreateMatch { opponent } => {
                let player1 = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                // Create new match state
                let match_state = GameState {
                    match_id: 0,
                    player1: PlayerInGame {
                        owner: player1,
                        health: 20,
                        mana: 3,
                        hand: vec![],
                        deck: (1..=10).collect(),
                        field: vec![],
                        graveyard: vec![],
                    },
                    player2: PlayerInGame {
                        owner: opponent,
                        health: 20,
                        mana: 3,
                        hand: vec![],
                        deck: (1..=10).collect(),
                        field: vec![],
                        graveyard: vec![],
                    },
                    current_turn: 1,
                    turn_timer: self.runtime.system_time(),
                    game_phase: GamePhase::WaitingForPlayers,
                    winner: None,
                };

                // Store match (creates match ID and links both players)
                let _match_id = self.state.create_match(player1, opponent, match_state).await.expect("Failed to create match");

                // Send cross-chain message to both players
                let match_chain = self.runtime.chain_id();
                let message = Message::MatchCreated {
                    match_chain,
                    player1,
                    player2: opponent,
                };

                vec![message]
            }

            Operation::PlayCard { card_id } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                // Get current match for this player
                if let Some(mut game) = self.state.get_match_for_player(&owner).await {
                    // Validate it's the player's turn
                    let is_player1 = game.player1.owner == owner;
                    let current_turn_matches = (game.current_turn % 2 == 1 && is_player1)
                        || (game.current_turn % 2 == 0 && !is_player1);

                    if !current_turn_matches {
                        return vec![];
                    }

                    // Get card from database
                    let cards = self.state.card_database.get();
                    let card = cards.iter().find(|c| c.id == card_id).cloned();

                    if let Some(card) = card {
                        // Update game state
                        let player = if is_player1 {
                            &mut game.player1
                        } else {
                            &mut game.player2
                        };

                        // Check mana
                        if player.mana >= card.cost {
                            player.mana -= card.cost;
                            player.field.push(card.clone());
                            
                            // Remove from hand (simplified)
                            if let Some(idx) = player.hand.iter().position(|c| c.id == card_id) {
                                player.hand.remove(idx);
                            }

                            // Update shared match
                            self.state.update_match(game).await.ok();

                            // Broadcast card played
                            return vec![Message::CardPlayed {
                                player: owner,
                                card,
                            }];
                        }
                    }
                }

                vec![]
            }

            Operation::EndTurn => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                if let Some(mut game) = self.state.get_match_for_player(&owner).await {
                    // Increment turn
                    game.current_turn += 1;
                    game.turn_timer = self.runtime.system_time();

                    // Determine next player
                    let next_player = if game.current_turn % 2 == 1 {
                        game.player1.owner
                    } else {
                        game.player2.owner
                    };

                    // Update shared match
                    self.state.update_match(game).await.ok();

                    // Broadcast turn ended
                    return vec![Message::TurnEnded { next_player }];
                }

                vec![]
            }

            Operation::AttackPlayer { attacker_id } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                if let Some(mut game) = self.state.get_match_for_player(&owner).await {
                    let is_player1 = game.player1.owner == owner;
                    
                    // Find attacker
                    let attacker_field = if is_player1 {
                        &game.player1.field
                    } else {
                        &game.player2.field
                    };

                    if let Some(attacker) = attacker_field.iter().find(|c| c.id == attacker_id) {
                        let damage = attacker.attack as i32;
                        
                        // Deal damage to opponent
                        if is_player1 {
                            game.player2.health -= damage;
                            if game.player2.health <= 0 {
                                game.winner = Some(1);
                                game.game_phase = GamePhase::Finished;
                            }
                        } else {
                            game.player1.health -= damage;
                            if game.player1.health <= 0 {
                                game.winner = Some(2);
                                game.game_phase = GamePhase::Finished;
                            }
                        }

                        // Update shared match
                        self.state.update_match(game.clone()).await.ok();

                        // Check if game ended
                        if game.game_phase == GamePhase::Finished {
                            let winner_owner = if game.winner == Some(1) {
                                Some(game.player1.owner)
                            } else {
                                Some(game.player2.owner)
                            };

                            // Update stats
                            if let Some(w) = winner_owner {
                                self.state.update_player_win(&w).await.ok();
                                let loser = if w == game.player1.owner {
                                    game.player2.owner
                                } else {
                                    game.player1.owner
                                };
                                self.state.update_player_loss(&loser).await.ok();
                            }

                            return vec![Message::GameFinished {
                                winner: winner_owner,
                                rewards: Amount::ZERO,
                            }];
                        }
                    }
                }

                vec![]
            }

            Operation::AttackCreature {
                attacker_id,
                defender_id,
            } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                if let Some(mut game) = self.state.get_match_for_player(&owner).await {
                    let is_player1 = game.player1.owner == owner;

                    // Combat logic (simplified)
                    let attacker_field = if is_player1 {
                        &mut game.player1.field
                    } else {
                        &mut game.player2.field
                    };

                    let defender_field = if is_player1 {
                        &mut game.player2.field
                    } else {
                        &mut game.player1.field
                    };

                    // Find creatures
                    let attacker = attacker_field.iter().find(|c| c.id == attacker_id).cloned();
                    let defender = defender_field.iter().find(|c| c.id == defender_id).cloned();

                    if let (Some(atk), Some(def)) = (attacker, defender) {
                        // Remove both if attack >= defense
                        if atk.attack >= def.defense {
                            defender_field.retain(|c| c.id != defender_id);
                        }
                        if def.attack >= atk.defense {
                            attacker_field.retain(|c| c.id != attacker_id);
                        }

                        // Update shared match
                        self.state.update_match(game).await.ok();
                    }
                }

                vec![]
            }

            Operation::InstantCounter {
                card_id,
                target_card,
            } => {
                let owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                // Get card
                let cards = self.state.card_database.get();
                let counter_card = cards.iter().find(|c| c.id == card_id).cloned();

                if let Some(card) = counter_card {
                    // Broadcast counter activated
                    return vec![Message::CounterActivated {
                        player: owner,
                        counter_card: card,
                        target_card,
                    }];
                }

                vec![]
            }

            Operation::RequestAIMove => {
                // AI oracle integration would go here
                // For now, return empty
                vec![]
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        match message {
            Message::MatchCreated {
                match_chain,
                player1,
                player2,
            } => {
                // Store match reference on player chains
            }

            Message::CardPlayed { player, card } => {
                // Update UI via event stream
            }

            Message::TurnEnded { next_player } => {
                // Notify next player
            }

            Message::GameFinished { winner, rewards } => {
                if let Some(winner_owner) = winner {
                    self.state.update_player_win(&winner_owner).await.ok();
                }
                // Increment total games
                let total = self.state.total_games_played.get();
                self.state.total_games_played.set(total + 1);
            }

            Message::CounterActivated {
                player,
                counter_card,
                target_card,
            } => {
                // Handle counter logic
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
