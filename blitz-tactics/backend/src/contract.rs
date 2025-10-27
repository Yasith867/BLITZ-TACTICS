use async_trait::async_trait;
use blitz_tactics::{Message, Operation};
use linera_sdk::{
    base::{AccountOwner, Amount, Timestamp},
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
        self.state.initialize_card_database().await;
        self.state.total_games_played.set(0);
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

            Operation::PlayCard { card_id } => {
                let _owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                vec![]
            }

            Operation::EndTurn => {
                vec![]
            }

            Operation::CreateMatch { opponent } => {
                let _player1 = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                vec![]
            }

            Operation::InstantCounter { card_id, target_card } => {
                let _owner = self
                    .runtime
                    .authenticated_signer()
                    .expect("Missing signer");

                vec![]
            }

            Operation::AttackPlayer { attacker_id } => {
                vec![]
            }

            Operation::AttackCreature { attacker_id, defender_id } => {
                vec![]
            }

            Operation::RequestAIMove => {
                vec![]
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        match message {
            Message::MatchCreated { match_chain, player1, player2 } => {
            }

            Message::CardPlayed { player, card } => {
            }

            Message::TurnEnded { next_player } => {
            }

            Message::GameFinished { winner, rewards } => {
                if let Some(winner_owner) = winner {
                    self.state.update_player_win(&winner_owner).await.ok();
                }
            }

            Message::CounterActivated { player, counter_card, target_card } => {
            }
        }
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
