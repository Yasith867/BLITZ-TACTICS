use async_graphql::{Request, Response, SimpleObject};
use linera_sdk::base::{AccountOwner, Amount, ChainId, Timestamp};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct Card {
    pub id: u32,
    pub name: String,
    pub description: String,
    pub attack: u32,
    pub defense: u32,
    pub cost: u32,
    pub card_type: CardType,
    pub ability: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub enum CardType {
    Creature,
    Spell,
    Counter,
    Buff,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PlayerStats {
    pub owner: AccountOwner,
    pub wins: u32,
    pub losses: u32,
    pub draws: u32,
    pub ranking: u32,
    pub total_matches: u32,
    pub cards_owned: Vec<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameState {
    pub player1: PlayerInGame,
    pub player2: PlayerInGame,
    pub current_turn: u8,
    pub turn_timer: Timestamp,
    pub game_phase: GamePhase,
    pub winner: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub struct PlayerInGame {
    pub owner: AccountOwner,
    pub health: i32,
    pub mana: u32,
    pub hand: Vec<Card>,
    pub deck: Vec<u32>,
    pub field: Vec<Card>,
    pub graveyard: Vec<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, SimpleObject)]
pub enum GamePhase {
    WaitingForPlayers,
    Player1Turn,
    Player2Turn,
    Finished,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Operation {
    CreatePlayerProfile,
    CreateMatch { opponent: AccountOwner },
    PlayCard { card_id: u32 },
    InstantCounter { card_id: u32, target_card: u32 },
    EndTurn,
    AttackPlayer { attacker_id: u32 },
    AttackCreature { attacker_id: u32, defender_id: u32 },
    RequestAIMove,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Message {
    MatchCreated { match_chain: ChainId, player1: AccountOwner, player2: AccountOwner },
    CardPlayed { player: AccountOwner, card: Card },
    TurnEnded { next_player: AccountOwner },
    GameFinished { winner: Option<AccountOwner>, rewards: Amount },
    CounterActivated { player: AccountOwner, counter_card: Card, target_card: u32 },
}

pub fn create_starter_deck() -> Vec<Card> {
    vec![
        Card {
            id: 1,
            name: "Lightning Bolt".to_string(),
            description: "Deal 3 damage to any target".to_string(),
            attack: 3,
            defense: 0,
            cost: 1,
            card_type: CardType::Spell,
            ability: None,
        },
        Card {
            id: 2,
            name: "Shield Wall".to_string(),
            description: "Creature with 2/5 stats".to_string(),
            attack: 2,
            defense: 5,
            cost: 3,
            card_type: CardType::Creature,
            ability: None,
        },
        Card {
            id: 3,
            name: "Swift Strike".to_string(),
            description: "Fast creature 4/2".to_string(),
            attack: 4,
            defense: 2,
            cost: 3,
            card_type: CardType::Creature,
            ability: Some("First Strike".to_string()),
        },
        Card {
            id: 4,
            name: "Nullify".to_string(),
            description: "Counter target spell or ability".to_string(),
            attack: 0,
            defense: 0,
            cost: 2,
            card_type: CardType::Counter,
            ability: Some("Instant".to_string()),
        },
        Card {
            id: 5,
            name: "Power Surge".to_string(),
            description: "+3/+3 to target creature".to_string(),
            attack: 0,
            defense: 0,
            cost: 2,
            card_type: CardType::Buff,
            ability: None,
        },
        Card {
            id: 6,
            name: "Fire Elemental".to_string(),
            description: "Powerful creature 5/5".to_string(),
            attack: 5,
            defense: 5,
            cost: 5,
            card_type: CardType::Creature,
            ability: None,
        },
        Card {
            id: 7,
            name: "Mana Crystal".to_string(),
            description: "Gain 2 mana this turn".to_string(),
            attack: 0,
            defense: 0,
            cost: 0,
            card_type: CardType::Spell,
            ability: None,
        },
        Card {
            id: 8,
            name: "Dragon Whelp".to_string(),
            description: "Flying creature 3/3".to_string(),
            attack: 3,
            defense: 3,
            cost: 4,
            card_type: CardType::Creature,
            ability: Some("Flying".to_string()),
        },
        Card {
            id: 9,
            name: "Heal".to_string(),
            description: "Restore 5 health".to_string(),
            attack: 0,
            defense: 0,
            cost: 2,
            card_type: CardType::Spell,
            ability: None,
        },
        Card {
            id: 10,
            name: "Berserker".to_string(),
            description: "High attack creature 6/3".to_string(),
            attack: 6,
            defense: 3,
            cost: 4,
            card_type: CardType::Creature,
            ability: None,
        },
    ]
}
