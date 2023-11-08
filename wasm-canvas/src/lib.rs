pub mod js;
pub mod nft_object;
pub mod web_asset_io;

use bevy::window::WindowResolution;
use bevy::prelude::*;
use bevy_panorbit_camera::{PanOrbitCamera, PanOrbitCameraPlugin};

use js_sys::Function as JsFunction;
use nft_object::ObjectNode;
use wasm_bindgen::prelude::*;

use js::{log, map_any_error, GetRootObjectFunction, GetObjectTreeFunction};
use web_asset_io::WebAssetIo;


const RIGGED_FIGURE_NAME: &'static str = "RiggedFigureScene";

// thread_local! {
//     static APP: OnceCell<App> = OnceCell::new();
// }

#[wasm_bindgen(js_name = runBevyApp)]
pub async fn run_bevy_app(
    canvas_selector: String,
    get_root_object: JsFunction,
    get_object_tree: JsFunction,
) -> Result<(), String> {
    // let body = reqwest::get("https://www.rust-lang.org")
    //     .await
    //     .unwrap()
    //     .text()
    //     .await
    //     .unwrap();
    // log(&body);

    let root_object_getter = GetRootObjectFunction::from(get_root_object);
    let root_object = map_any_error(root_object_getter.call())?;
    log(serde_json::to_string_pretty(&root_object).unwrap().as_str());

    let object_tree_getter = GetObjectTreeFunction::from(get_object_tree);
    let object_tree = map_any_error(object_tree_getter.call())?;
    log(serde_json::to_string_pretty(&object_tree).unwrap().as_str());

    // let get_strings = GetChildObjectsFunction::from(get_strings);
    // let multiple_strings = map_any_error(get_strings.call(&a_string))?;
    // for a_str in &multiple_strings {
    //     log(a_str);
    // }

    let window = Window {
        canvas: Some(canvas_selector),
        transparent: true,
        resolution: WindowResolution::new(800., 600.),
        ..default()
    };

    let asset_server = AssetServer::with_boxed_io(Box::new(WebAssetIo {
        default_io: AssetPlugin::default().create_platform_default_asset_io(),
    }));

    App::new()
        .insert_resource(asset_server)
        // .insert_resource(root_object)
        .insert_resource(object_tree)
        .insert_resource(AmbientLight::default())
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(window),
            ..default()
        }))
        // .add_plugins(ScreenSpaceAmbientOcclusionPlugin)  // GPU does not support this (wasm)
        .add_plugins(PanOrbitCameraPlugin)
        .add_systems(Startup, setup_3d)
        .run();

    Ok(())
}

fn setup_3d(
    mut commands: Commands,
    asset_server: Res<AssetServer>,
    root_node: Res<ObjectNode>,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    commands.spawn(PbrBundle {
        mesh: meshes.add(Mesh::from(shape::Plane {
            size: 5.0,
            subdivisions: 0,
        })),
        material: materials.add(Color::rgb(0.3, 0.5, 0.3).into()),
        ..default()
    });

    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 3000.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(8.0, 8.0, 8.0),
        ..default()
    });

    commands.spawn(PbrBundle {
        mesh: meshes.add(Mesh::from(shape::Cube { size: 0.5 })),
        material: materials.add(Color::rgb(0.8, 0.7, 0.6).into()),
        transform: Transform::from_xyz(9.1, 9.1, 9.1),
        ..default()
    });

    commands.spawn(PbrBundle {
        mesh: meshes.add(Mesh::from(shape::Cube { size: 0.5 })),
        material: materials.add(Color::rgb(1., 0., 0.).into()),
        transform: Transform::from_xyz(0., -0.8, 0.),
        ..default()
    });
    // commands.spawn(DirectionalLightBundle {
    //     transform: Transform::from_xyz(4.0, 16.0, 4.0),
    //
    //     ..default()
    // });

    commands.spawn((
        Camera3dBundle {
            transform: Transform::from_xyz(1., 1.5, 2.),
            ..default()
        },
        PanOrbitCamera {
            focus: Vec3::new(0.0, 0., 0.0),
            ..default()
        },
    ));
    let root_object = &root_node.inner.as_ref().unwrap().object_3d;
    let scene: Handle<Scene> = asset_server.load(root_object.model_uri.as_str());

    commands.spawn((
        SceneBundle {
            scene,
            transform: (&root_object.transform).into(),
            ..default()
        },
        Name::new(RIGGED_FIGURE_NAME),
    ));

    let mut i = 0;
    for child in &root_node.children {
        let object = &child.inner.as_ref().unwrap().object_3d;
        let scene: Handle<Scene> = asset_server.load(object.model_uri.as_str());
        // Final Transform of the object is the combination of the root_object's slot transform,
        // child object's anchor transform and child object's transform:
        let transform =
            Transform::from(&root_object.transform) *
            Transform::from(&root_object.slots.parsed[i].transform) *
            Transform::from(&object.anchors.parsed.first().unwrap().transform) *
            Transform::from(&object.transform);
        // log(&format!("{:#?}", root_object.slots.parsed[i]));
        commands.spawn((
            SceneBundle {
                scene,
                transform,
                ..default()
            },
            Name::new(format!("{}-{}", RIGGED_FIGURE_NAME, i)),
        ));
        i += 1;
    }
}

