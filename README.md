# Composable-3D POC

The purpose of this POC is to demonstrate how one can use the sui blockchain to create composable 3D objects.

## Potential Applications

The first 4 were in my view, the rest are additions from Chat-GPT:
1. Dynamic In-Game World Building:
    - Game developers can use composable 3d assets to create dynamic and ever-changing game worlds. Players can own and customize their in-game environments, bringing a new level of personalization and immersion to games.
2. User-Generated Content:
    - Empower players to create their own game content by allowing them to assemble and modify scenes with NFT assets. This encourages user-generated content and extends the lifespan of games.
3. Cross-Game Compatibility:
    - Standardized NFT formats for 3D assets and scenes could lead to cross-game compatibility. Players could take their customized scenes from one game to another, creating a seamless experience across different gaming environments.
4. New Gameplay Mechanics:
    - Game developers can create innovative gameplay mechanics based on the ownership and interaction of NFT assets. For example, players could use their NFT scenes to solve puzzles, gain advantages, or unlock content.
5. Reduced Development Costs:
    - Game developers can save time and money by leveraging pre-existing 3D assets and scenes from the blockchain marketplace, reducing the need for in-house asset creation.
6. Global Accessibility:
    - Your infrastructure can make 3D assets and scenes accessible to developers and players worldwide, breaking down geographic barriers and fostering a global community of creators.
7. Sustainability and Environmental Impact:
    - Storing assets and scenes on a blockchain can contribute to a more sustainable game development ecosystem by reducing the need for centralized servers and data centers.
8. Collaborative Game Development:
    - Game development teams can collaborate more effectively by composing objects from a shared library of external assets. This allows artists, designers, and developers to contribute their expertise to the creation of game content.
9. Monetization for 3D Artists:
    - 3D artists can offer their objects or object components for composition from external sources. This provides artists with new monetization opportunities and incentivizes the creation of high-quality, modular objects.
10. Blockchain-Backed Ownership:
    - Players and developers can have verifiable ownership of 3D assets and scenes, eliminating disputes over asset rights and enabling secure and transparent asset trading.

## "MVP"

Create a composable Kiosk in which the owner can display its Listings in a 3D view
- The Kiosk 3D asset would have some Slots with their transformations in respect to the object origin.
- In order for a listing to attach to a Slot, it needs to have an Anchor with its transformation in respect to the object origin.
- Anchors and Slots can have a type which defines their compatibility.

## Structure

#### Object3D
- `model_uri`: A string field representing the URI or reference to the 3D model associated with this object.
- `slots`: A vector (array) of Slot objects indicating slots that this object can receive items via their anchors.
- `anchors`: A vector of Anchor objects that define how this object can attach to other objects.
- `transform`: A Transform object specifying the position, rotation, and scale of this object. Can be used on attached objects as well to fine-grain the attachment.
- `attached`: An optional field that can reference an Anchor, indicating if this object is attached using the anchor.

#### Slot:
- `type`: A string field indicating the type of slot. This can be used to enforce compatibility rules.
- `transform`: A Transform object specifying the position, rotation, and scale of this slot within the parent Object3D.
- `attached`: An optional field that can reference an Object3D object, indicating if another object is attached to this slot.

#### Anchor:
- `attaches_to`: A string field indicating the type of slot to which this anchor can attach.
- `Transform`:A Transform object specifying how objects attached to this anchor should be transformed in relation to this anchor.

#### Transform:
The Transform object contains fields (e.g., m00, m01, etc.) representing the transformation matrix for positioning, rotating, and scaling objects in 3D space.
- `m01`
- `m02`
- ...
- `m32`
- `m33`


### Directories structure

- move:
    - Contains the Move code of the smart contracts
    - Contains a sample package named `poc` where the developer can add a move module and start building

- app
    - Contains a Typescript React App, boostrapped with Vite.

- setup
    - A Typescript project, with ready-to-use:
        - environment variable (.env) file reading
        - Sui SDK integration
        - publish shell script
