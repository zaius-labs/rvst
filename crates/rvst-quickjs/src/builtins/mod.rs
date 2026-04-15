pub mod fs;
pub mod crypto;
pub mod compress;
pub mod system;

/// Register all built-in capability commands.
pub fn register_all() {
    fs::register();
    crypto::register();
    compress::register();
    system::register();
}
