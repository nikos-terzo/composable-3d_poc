use bevy::{
    asset::{AssetIo, AssetIoError, ChangeWatcher},
    utils::BoxedFuture,
};
use std::path::{Path, PathBuf};

/// Wraps the default bevy AssetIo and adds support for loading http urls
pub struct WebAssetIo {
    pub(crate) default_io: Box<dyn AssetIo>,
}

fn is_http(path: &Path) -> bool {
    path.starts_with("http://") || path.starts_with("https://")
}

impl AssetIo for WebAssetIo {
    fn load_path<'a>(&'a self, path: &'a Path) -> BoxedFuture<'a, Result<Vec<u8>, AssetIoError>> {
        if is_http(path) {
            let uri = path.to_str().unwrap();

            let fut = Box::pin(async move {
                let bytes = reqwest::get(uri)
                    .await
                    .map_err(|_| AssetIoError::NotFound(path.to_path_buf()))?
                    .bytes()
                    .await
                    .map_err(|_| AssetIoError::NotFound(path.to_path_buf()))?
                    .to_vec();
                Ok(bytes)
            });

            fut
        } else {
            self.default_io.load_path(path)
        }
    }

    fn read_directory(
        &self,
        path: &Path,
    ) -> Result<Box<dyn Iterator<Item = PathBuf>>, AssetIoError> {
        self.default_io.read_directory(path)
    }

    fn watch_path_for_changes(
        &self,
        to_watch: &Path,
        to_reload: Option<PathBuf>,
    ) -> Result<(), AssetIoError> {
        if is_http(to_watch) {
            // TODO: we could potentially start polling over http here
            // but should probably only be done if the server supports caching

            // This is where we would write to a self.network_watcher

            Ok(()) // Pretend everything is fine
        } else {
            self.default_io.watch_path_for_changes(to_watch, to_reload)
        }
    }

    fn watch_for_changes(&self, _change_watcher: &ChangeWatcher) -> Result<(), AssetIoError> {
        // self.default_io.watch_for_changes(change_watcher)
        // Do nothing
        Ok(())
    }

    fn is_dir(&self, path: &Path) -> bool {
        if is_http(path) {
            false
        } else {
            self.default_io.is_dir(path)
        }
    }

    fn get_metadata(&self, path: &Path) -> Result<bevy::asset::Metadata, AssetIoError> {
        self.default_io.get_metadata(path)
    }
}

