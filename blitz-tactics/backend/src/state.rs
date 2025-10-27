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
    pub active_matches: MapView<AccountOwner, GameState>,
    pub card_database: RegisterView<Vec<Card>>,
    pub total_games_played: RegisterView<u64>,
}

#[async_trait::async_trait]
impl BlitzTacticsState {
    pub async fn initialize_card_database(&mut self) {
        let cards = crate::create_starter_deck();
        self.card_database.set(cards);
    }

    pub async fn get_player_stats(&self, owner: &AccountOwner) -> Option<PlayerStats> {
        self.players.get(owner).await.ok().flatten()
    }

    pub async fn create_player(&mut self, owner: AccountOwner) -> Result<(), String> {
        if self.players.get(&owner).await.is_ok() {
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

        self.players.insert(&owner, player_stats).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn update_player_win(&mut self, owner: &AccountOwner) -> Result<(), String> {
        if let Some(mut stats) = self.players.get(owner).await.ok().flatten() {
            stats.wins += 1;
            stats.total_matches += 1;
            stats.ranking = stats.ranking.saturating_add(25);
            self.players.insert(owner, stats).map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    pub async fn update_player_loss(&mut self, owner: &AccountOwner) -> Result<(), String> {
        if let Some(mut stats) = self.players.get(owner).await.ok().flatten() {
            stats.losses += 1;
            stats.total_matches += 1;
            stats.ranking = stats.ranking.saturating_sub(15);
            self.players.insert(owner, stats).map_err(|e| e.to_string())?;
        }
        Ok(())
    }
}

use async_graphql::SimpleObject;
