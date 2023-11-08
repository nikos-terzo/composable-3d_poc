
module poc::object3d {
    use std::option::{Self, Option};
    use std::string::String;
    use std::vector;

    use sui::object::{Self, ID, UID};
    use sui::table::{Self, Table};
    use sui::tx_context::TxContext;

    use poc::transform::{Self, Transform};

    const ESlotOccupied: u64 = 0;
    const EIncompatibleAnchorSlot: u64 = 1;

    struct Object3D has key, store {
        id: UID,
        model_uri: String,
        slots: Table<SlotID, Slot>,
        anchors: Table<AnchorID, Anchor>,
        transform: Transform,
        attached: Option<AnchorID>,
    }

    struct SlotID has store, copy, drop {
        id: u32
    }
    struct Slot has store, copy, drop {
        id: SlotID,
        type: String,
        transform: Transform,
        attached: Option<ID>
    }

    struct AnchorID has store, copy, drop {
        id: u32
    }
    struct Anchor has store, copy, drop {
        id: AnchorID,
        attaches_to: String,
        transform: Transform
    }

    public fun mint_object(
        model_uri: String,
        denominator: u64,
        transform: vector<u64>,
        ctx: &mut TxContext
    ): Object3D {
        let transform = if (vector::length(&transform) == 0 || denominator == 0) {
            transform::unit()
        } else {
            transform::from_denominator_vec(denominator, transform)
        };
        Object3D {
            id: object::new(ctx),
            model_uri,
            slots: table::new(ctx),
            anchors: table::new(ctx),
            transform,
            attached: option::none()
        }
    }

    public fun insert_slot(
        object: &mut Object3D,
        slot_id: u32,
        type: String,
        transform_denominator: u64,
        transform_mat: vector<u64>
    ) {
        let transform = transform::from_denominator_vec(transform_denominator, transform_mat);
        let slot = Slot {
            id: SlotID { id: slot_id },
            type,
            transform,
            attached: option::none()
        };
        table::add(&mut object.slots, slot.id, slot);
    }

    public fun insert_anchor(
        object: &mut Object3D,
        anchor_id: u32,
        attaches_to: String,
        transform_denominator: u64,
        transform_mat: vector<u64>
    ) {
        let transform = transform::from_denominator_vec(transform_denominator, transform_mat);
        let anchor = Anchor {
            id: AnchorID { id: anchor_id },
            attaches_to,
            transform
        };
        table::add(&mut object.anchors, anchor.id, anchor);
    }

    public fun attach_to_slot(
        object: &mut Object3D,
        slot_id: u32,
        object_to_attach: &mut Object3D,
        anchor_id: u32
    ) {
        let slot = table::borrow_mut(&mut object.slots, SlotID { id: slot_id });
        let anchor = table::borrow_mut(&mut object_to_attach.anchors, AnchorID { id: anchor_id });
        option::fill(&mut object_to_attach.attached, AnchorID { id: anchor_id });
        assert!(option::is_none(&slot.attached), ESlotOccupied);
        assert!(slot.type == anchor.attaches_to, EIncompatibleAnchorSlot);
        slot.attached = option::some(object::uid_to_inner(&object_to_attach.id));
    }
}
