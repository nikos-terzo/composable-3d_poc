use serde::{Deserialize, Serialize};

use bevy::{ecs::system::Resource, prelude::Transform};


#[derive(Debug, Deserialize, Serialize)]
pub struct Object3DWithRef {
    #[serde(rename = "object3D")]
    pub object_3d: Object3D,
    #[serde(rename = "suiObjectRef")]
    pub sui_object_ref: SuiObjectRef
}

#[derive(Debug, Deserialize, Serialize, Resource)]
pub struct Object3D {
    pub id: String,
    pub model_uri: String,
    pub slots: MoveTable<Slot>,
    pub anchors: MoveTable<Anchor>,
    pub transform: MoveTransform,
    #[serde(rename = "attachedWithAnchor")]
    pub attached_with_anchor: Option<u32>
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SuiObjectRef {
    #[serde(rename = "objectId")]
    object_id: String,
    version: String,
    digest: String
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MoveTable<T> {
    pub id: String,
    pub size: u64,
    pub parsed: Vec<T>
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct SlotID {
    pub id: u32,
}

#[derive(Debug, Deserialize, Serialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct AnchorID {
    pub id: u32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Slot {
    pub id: u32,
    #[serde(rename = "type")]
    pub type_: String,
    pub transform: MoveTransform,
    pub attached: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Anchor {
    pub id: u32,
    #[serde(rename = "attachesTo")]
    pub attaches_to: String,
    pub transform: MoveTransform,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MoveTransform {
    pub m00: f32,
    pub m01: f32,
    pub m02: f32,
    pub m03: f32,
    pub m10: f32,
    pub m11: f32,
    pub m12: f32,
    pub m13: f32,
    pub m20: f32,
    pub m21: f32,
    pub m22: f32,
    pub m23: f32,
    pub m30: f32,
    pub m31: f32,
    pub m32: f32,
    pub m33: f32,
}

impl From<&MoveTransform> for Transform {
    fn from(m: &MoveTransform) -> Self {
        Transform::from_matrix(bevy::math::Mat4::from_cols_array_2d(&[
                [m.m00, m.m10, m.m20, m.m30],
                [m.m01, m.m11, m.m21, m.m31],
                [m.m02, m.m12, m.m22, m.m32],
                [m.m03, m.m13, m.m23, m.m33],
        ]))
    }
}


#[derive(Debug, Deserialize, Serialize, Resource)]
pub struct ObjectNode {
    pub children: Vec<ObjectNode>,
    pub inner: Option<Object3DWithRef>
}

impl ObjectNode {
    pub fn id(&self) -> Option<String> {
        match self.inner {
            Some(ref inner) => Some(inner.object_3d.id.clone()),
            None => None
        }
    }
}

impl PartialEq for ObjectNode {
    fn eq(&self, other: &Self) -> bool {
        match (self.id(), other.id()) {
            (Some(_), None) => false,
            (None, Some(_)) => false,
            (None, None) => true,
            (Some(ref id1), Some(ref id2)) => id1 == id2
        }
    }
}

impl Eq for ObjectNode {}

impl PartialOrd for ObjectNode {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        match (self.id(), other.id()) {
            (Some(_), None) => Some(std::cmp::Ordering::Greater),
            (None, Some(_)) => Some(std::cmp::Ordering::Less),
            (None, None) => Some(std::cmp::Ordering::Equal),
            (Some(ref id1), Some(ref id2)) => Some(id1.cmp(id2))
        }
    }
}

impl Ord for ObjectNode {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        match (self.id(), other.id()) {
            (Some(_), None) => std::cmp::Ordering::Greater,
            (None, Some(_)) => std::cmp::Ordering::Less,
            (None, None) => std::cmp::Ordering::Equal,
            (Some(ref id1), Some(ref id2)) => id1.cmp(id2)
        }
    }
}

