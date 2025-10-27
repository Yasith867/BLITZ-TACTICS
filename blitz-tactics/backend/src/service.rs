use async_graphql::{Context, EmptySubscription, Object, Request, Response, Schema};
use async_trait::async_trait;
use blitz_tactics::{Card, GameState, PlayerStats};
use linera_sdk::{base::AccountOwner, Service, ServiceRuntime};

pub struct BlitzTacticsService {
    state: blitz_tactics::state::BlitzTacticsState,
    runtime: ServiceRuntime<Self>,
}

linera_sdk::service!(BlitzTacticsService);

impl With<ServiceRuntime<Self>> for BlitzTacticsService {
    fn with(runtime: ServiceRuntime<Self>) -> Self {
        let state = blitz_tactics::state::BlitzTacticsState::load(runtime.storage_context())
            .expect("Failed to load state");
        BlitzTacticsService { state, runtime }
    }
}

#[async_trait]
impl Service for BlitzTacticsService {
    type Parameters = ();

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            QueryRoot { state: &self.state },
            MutationRoot { state: &self.state },
            EmptySubscription,
        )
        .finish();

        schema.execute(request).await
    }
}

struct QueryRoot<'a> {
    state: &'a blitz_tactics::state::BlitzTacticsState,
}

#[Object]
impl<'a> QueryRoot<'a> {
    /// Get player statistics by owner address
    async fn player_stats(&self, owner: String) -> Option<PlayerStats> {
        let account_owner: AccountOwner = serde_json::from_str(&format!("\"{}\"", owner)).ok()?;
        self.state.get_player_stats(&account_owner).await
    }

    /// Get all available cards
    async fn card_database(&self) -> Vec<Card> {
        self.state.card_database.get().clone()
    }

    /// Get a specific card by ID
    async fn card(&self, id: u32) -> Option<Card> {
        self.state
            .card_database
            .get()
            .iter()
            .find(|c| c.id == id)
            .cloned()
    }

    /// Get total number of games played globally
    async fn total_games(&self) -> u64 {
        self.state.total_games_played.get()
    }

    /// Get active match for a player
    async fn active_match(&self, owner: String) -> Option<GameState> {
        let account_owner: AccountOwner = serde_json::from_str(&format!("\"{}\"", owner)).ok()?;
        self.state.get_match_for_player(&account_owner).await
    }

    /// Health check endpoint
    async fn status(&self) -> String {
        "BLITZ TACTICS is running!".to_string()
    }
}

struct MutationRoot<'a> {
    state: &'a blitz_tactics::state::BlitzTacticsState,
}

#[Object]
impl<'a> MutationRoot<'a> {
    /// Placeholder mutation (actual mutations happen via Operations)
    async fn placeholder(&self) -> bool {
        true
    }
}
