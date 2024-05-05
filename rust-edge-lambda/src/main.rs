use serde::{Deserialize, Serialize};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
   sub: String,
   name: String,
   exp: usize,
   scope: Vec<String>
}

fn main() {
    let token = "".to_string();
    println!("{}", if verify_token(&token) { "Token is valid" } else { "Token is invalid" });
}

fn verify_token(token: &str) -> bool {
    let decoded_token = decode::<Claims>(&token, &DecodingKey::from_secret("secret".as_ref()), &Validation::new(Algorithm::HS256));
    let valid_permissions = vec!["view:data"];
    match decoded_token {
        Ok(token_data) => {
            println!("{:?}", token_data.claims);
            return has_permissions(token_data.claims.scope, valid_permissions);
        },
        Err(e) => {
            println!("{:?}", e);
            return false;
        }
    }
}

fn has_permissions(scopes: Vec<String>, valid_permissions: Vec<&str>) -> bool {
    return valid_permissions.iter().all(|permission| scopes.contains(&permission.to_string()));
}