// see devsrv.config.json for threejs version dynamically replaced by devsrv
import * as THREE from 'https://cdn.skypack.dev/three@0.135';
import { BoxLineGeometry } from 'https://cdn.skypack.dev/three@0.135/examples/jsm/geometries/BoxLineGeometry.js';
import { XRControllerModelFactory } from 'https://cdn.skypack.dev/three@0.135/examples/jsm/webxr/XRControllerModelFactory.js';

import { CanvasUI } from '../../jsm/CanvasUI.js'
import { VRButton } from '../../jsm/VRButton.js';

class App{
	constructor(){
		const container = document.createElement( 'div' );
		document.body.appendChild( container );
                
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
		this.camera.position.set( 0, 1.6, 0 );
        
		this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x505050 );
        this.scene.add( this.camera );

		this.scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

        const light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 ).normalize();
		this.scene.add( light );
			
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
		container.appendChild( this.renderer.domElement );
        
        this.initScene();
        this.setupXR();
        
        window.addEventListener('resize', this.resize.bind(this) );
	}	
    
    initScene(){
        this.room = new THREE.LineSegments(
					new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ),
					new THREE.LineBasicMaterial( { color: 0x808080 } )
				);
        this.room.geometry.translate( 0, 3, 0 );
        this.scene.add( this.room );

        const geometry = new THREE.SphereGeometry(0.1, 32, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0x00FF00 });
        this.ball = new THREE.Mesh( geometry, material );
        this.ball.position.set(0, 1, -1);
        this.scene.add( this.ball );
        
        this.createUI();
    }
    
    createUI() {
        const config = {
            dropdown: { type: "dropdown", position: { left: 20, top: 20 }, width:472, height:34, min:0.5, max:2, onChange },
            info: { type: "text", position: { left: 20, top: 64 }, fontSize:18, },
            opacity: 1,
            renderer: this.renderer
        }
        const content = {
            dropdown: [{txt:'None', val:null}, {txt:'Red', val:0xFF0000},{txt:'Yellow', val:0xFFFF00},{txt:'Green', val:0x00FF00},
            {txt:'Blue', val:0x0000FF},{txt:'Purple', val:0xFF00FF}],
            info: "Use the dropdown to select a color"
        }
        this.ui = new CanvasUI( content, config );

        const self = this;

        function onChange(obj){
            const msg = `Dropdown selection changed to (${obj.txt})`;
            this.ui.updateElement('info', msg);
            if (obj.val!==null) this.ball.material.color.set(obj.val);
        }
    }
    
    setupXR(){
        this.renderer.xr.enabled = true; 
        
        const self = this;
        
        function onSessionStart(){
            self.ui.mesh.position.set( 0, 1.5, -1.2 );
            self.scene.attach(self.ui.mesh);
        }
        
        function onSessionEnd(){
            self.scene.remove( self.ui.mesh );
        }
        
        const btn = new VRButton( this.renderer, { onSessionStart, onSessionEnd } );
        
        const controllerModelFactory = new XRControllerModelFactory();

        // controller
        this.controller = this.renderer.xr.getController( 0 );
        this.scene.add( this.controller );
                
        this.controllerGrip = this.renderer.xr.getControllerGrip( 0 );
        this.controllerGrip.add( controllerModelFactory.createControllerModel( this.controllerGrip ) );
        this.scene.add( this.controllerGrip );
        
        // controller
        this.controller1 = this.renderer.xr.getController( 1 );
        this.scene.add( this.controller1 );

        this.controllerGrip1 = this.renderer.xr.getControllerGrip( 1 );
        this.controllerGrip1.add( controllerModelFactory.createControllerModel( this.controllerGrip1 ) );
        this.scene.add( this.controllerGrip1 );
        
        //
        const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

        const line = new THREE.Line( geometry );
        line.name = 'line';
		line.scale.z = 10;

        this.controller.add( line.clone() );
        this.controller1.add( line.clone() );
        
        this.selectPressed = false;

        this.renderer.setAnimationLoop( this.render.bind(this) );
    }
    
    resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );  
    }
    
	render( ) {   
        if ( this.renderer.xr.isPresenting ) this.ui.update();
        this.renderer.render( this.scene, this.camera );
    }
}

export { App };