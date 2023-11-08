import { MoveStruct, SuiClient, SuiObjectRef } from "@mysten/sui.js/client";
import { MoveObject3D, Object3D, intoObject3D } from "../types/object3d";
import { MoveSlotField, intoSlot } from "../types/slot";
import { MoveAnchorField, intoAnchor } from "../types/anchor";
import { PACKAGE_ID } from "../config";

export type Object3DWithRef = { suiObjectRef: SuiObjectRef, object3D: Object3D };

export type ObjectTreeNode = {
    parent?: ObjectTreeNode,
    inner: Object3DWithRef,
    children: ObjectTreeNode[]
};

export async function getObject3D(suiClient: SuiClient, id: string): Promise<Object3DWithRef | null | undefined> {
    const queryResp = await suiClient.getObject({
        id,
        options: {
            showContent: true
        }
    });
    const content = queryResp.data?.content as {
        datatype: 'moveObject',
        fields: MoveObject3D | null,
        hasPublicTranfer: boolean,
        type: string
    } | null | undefined;

    if (!queryResp.data ||
        !queryResp.data.digest ||
        !queryResp.data.objectId ||
        !queryResp.data.version ||
        !content ||
        !content.fields) {
        return;
    }
    return {
        suiObjectRef: { ...queryResp.data },
        object3D: intoObject3D(content.fields)
    };
}

/* Recursive function */
// TODO slots pagination,
// Cycle detection
// GraphQL instead of RPC recurse
async function updateChildren(suiClient: SuiClient, node: ObjectTreeNode): Promise<null | undefined> {

    if (node.children.length) {
        console.log("TODO updateChildren called with non-empty children");
        return;
    }

    const slotsResp = await suiClient.getDynamicFields({ parentId: node.inner.object3D.slots.id });
    for (const data of slotsResp.data) {
        const slotData = await suiClient.getObject({ id: data.objectId, options: { showContent: true } });
        const slotContents = slotData.data?.content as {
            dataType: 'moveObject';
            fields: MoveSlotField;
            hasPublicTransfer: boolean;
            type: string;
        };


        if (!slotContents.fields.value.fields.attached) {
            continue;
        }

        node.inner.object3D.slots.parsed = [
            ...node.inner.object3D.slots.parsed,
            intoSlot(slotContents.fields.value.fields)
        ];

        const newChildInner = await getObject3D(suiClient, slotContents.fields.value.fields.attached);
        if (!newChildInner) {
            continue;
        }
        if (newChildInner.object3D.attachedWithAnchor === undefined ||
            newChildInner.object3D.attachedWithAnchor === null) {
            console.log("Something went wrong. Object is attached but attached is not set");
            return;
        }
        const anchorId: MoveStruct = {
            fields: {
                "id": newChildInner.object3D.attachedWithAnchor
            }
        }

        const anchorData = await suiClient.getDynamicFieldObject({
            parentId: newChildInner.object3D.anchors.id,
            name: { type: `${PACKAGE_ID}::object3d::AnchorID`, value: anchorId.fields }
        });
        
        console.log("===============================");
        console.log(JSON.stringify(anchorData));
        console.log("===============================");

        const anchorContents = anchorData.data?.content as {
            dataType: 'moveObject';
            fields: MoveAnchorField;
            hasPublicTransfer: boolean;
            type: string;
        };

        newChildInner.object3D.anchors.parsed = [
            ...newChildInner.object3D.anchors.parsed,
            intoAnchor(anchorContents.fields.value.fields)
        ];

        const newChild: ObjectTreeNode = {
            parent: node,
            inner: newChildInner,
            children: []
        };

        await updateChildren(suiClient, newChild);

        node.children.push(newChild);
    }
}

export async function getObjectTree(suiClient: SuiClient, rootId: string): Promise<ObjectTreeNode | null | undefined> {
    const rootObject = await getObject3D(suiClient, rootId);

    if (!rootObject) {
        return;
    }

    const rootNode: ObjectTreeNode = {
        inner: rootObject,
        children: []
    };

    await updateChildren(suiClient, rootNode);

    return rootNode;
}
