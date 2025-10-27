use crate::{Card, GameState, PlayerStats};
use linera_sdk::{
    base::AccountOwner,
    views::{MapView, RegisterView, RootView, ViewStorageContext},
};
use serde::{Deserialize, Serialize};

#[derive(RootView, SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct BlitzTacticsState {
    pub players: MapView<AccountOwner, PlayerStats>,
    pub active_matches: MapView<u64, GameState>,
    pub player_matches: MapView<AccountOwner, u64>,
    pub card_database: RegisterView<Vec<Card>>,
    pub total_games_played: RegisterView<u64>,
    pub next_match_id: RegisterView<u64>,
}

#[async_trait::async_trait]
impl BlitzTacticsState {
    pub async fn initialize_card_database(&mut self) -> Result<(), String> {
        let cards = crate::create_starter_deck();
        self.card_database.set(cards);
        Ok(())
    }

    pub async fn get_player_stats(&self, owner: &AccountOwner) -> Option<PlayerStats> {
        self.players.get(owner).await.ok().flatten()
    }

    pub async fn create_player(&mut self, owner: AccountOwner) -> Result<(), String> {
        // Check if player exists
        if let Some(_) = self.players.get(&owner).await.ok().flatten() {
            return Err("Player already exists".to_string());
        }

        let starter_cards: Vec<u32> = (1..=10).collect();
        let player_stats = PlayerStats {
            owner,
            wins: 0,
            losses: 0,
            draws: 0,
            ranking: 1000,
            total_matches: 0,
            cards_owned: starter_cards,
        };

        self.players
            .insert(&owner, player_stats)
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn create_match(
        &mut self,
        player1: AccountOwner,
        player2: AccountOwner,
        mut game_state: GameState,
    ) -> Result<u64, String> {
        // Get next match ID
        let match_id = self.next_match_id.get();
        self.next_match_id.set(match_id + 1);
        
        // Set match ID in game state
        game_state.match_id = match_id;
        
        // Store match by ID
        self.active_matches
            .insert(&match_id, game_state)
            .map_err(|e| e.to_string())?;
        
        // Link both players to this match
        self.player_matches
            .insert(&player1, match_id)
            .map_err(|e| e.to_string())?;
        self.player_matches
            .insert(&player2, match_id)
            .map_err(|e| e.to_string())?;
        
        Ok(match_id)
    }

    pub async fn get_match_for_player(&self, owner: &AccountOwner) -> Option<GameState> {
        // Get match ID for this player
        let match_id = self.player_matches.get(owner).await.ok().flatten()?;
        
        // Get match by ID
        self.active_matches.get(&match_id).await.ok().flatten()
    }

    pub async fn get_match_by_id(&self, match_id: u64) -> Option<GameState> {
        self.active_matches.get(&match_id).await.ok().flatten()
    }

    pub async fn update_match(&mut self, game_state: GameState) -> Result<(), String> {
        let match_id = game_state.match_id;
        self.active_matches
            .insert(&match_id, game_state)
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn end_match(&mut self, match_id: u64) -> Result<(), String> {
        // Get match to find players
        if let Some(game) = self.active_matches.get(&match_id).await.ok().flatten() {
            // Remove player references
            self.player_matches.remove(&game.player1.owner).map_err(|e| e.to_string())?;
            self.player_matches.remove(&game.player2.owner).map_err(|e| e.to_string())?;
        }
        
        // Remove match
        self.active_matches
            .remove(&match_id)
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn update_player_win(&mut self, owner: &AccountOwner) -> Result<(), String> {
        if let Some(mut stats) = self.players.get(owner).await.ok().flatten() {
            stats.wins += 1;
            stats.total_matches += 1;
            stats.ranking = stats.ranking.saturating_add(25);
            self.players
                .insert(owner, stats)
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn update_player_loss(&mut self, owner: &AccountOwner) -> Result<(), String> {
        if let Some(mut stats) = self.players.get(owner).await.ok().flatten() {
            stats.losses += 1;
            stats.total_matches += 1;
            stats.ranking = stats.ranking.saturating_sub(15);
            self.players
                .insert(owner, stats)
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn add_card_to_player(
        &mut self,
        owner: &AccountOwner,
        card_id: u32,
    ) -> Result<(), String> {
        if let Some(mut stats) = self.players.get(owner).await.ok().flatten() {
            if !stats.cards_owned.contains(&card_id) {
                stats.cards_owned.push(card_id);
                self.players
                    .insert(owner, stats)
                    .map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }
}

use async_graphql::SimpleObject;
