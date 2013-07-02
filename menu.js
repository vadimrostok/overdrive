/*var textMeshes, geometry = [], i = 0;
var w = 10;//1700, h = 800;
var h = 5;//

var setText = (function(fontStyle) {
    var textHeight = 50;
    return function(xyz, rot_xyz, text) {

        geometry[i] = new THREE.TextGeometry( text, {
        size: 0.5,
        height: textHeight,
        font: 'helvetiker',
        weight: 'bold',
        style: 'normal',
    });
        THREE.GeometryUtils.center( geometry[i] );
        textMesh = new THREE.Mesh( geometry[i], new THREE.MeshLambertMaterial({
            color: 0x0055ff,
            combine: THREE.MixOperation,
            reflectivity: 0.3
        }));

        textMesh.rotation.set(rot_xyz[0], rot_xyz[1], rot_xyz[2]);
        textMesh.position.set( xyz[0], xyz[1], textHeight + xyz[2]);

        i++;

        return textMesh;

    }

})(
    1
);

textMeshes = [
    setText([0, h, 0], [0, Math.PI, 0], 'Accelerate'),
    setText([0, 0, 0], [0, Math.PI, 0], 'Brake'),
    setText([w * 0.7, h * 0.5, 0], [0, Math.PI, 0], 'Left'),
    setText([-w * 0.7, h * 0.5, 0], [0, Math.PI, 0], 'Right'),
    setText([0, h * 0.5, 0], [0, Math.PI, 0], 'Click to start the game')
];*/
define([
        'three'
    ], 
    function(THREE) {

        var menu = new (function() {

            this.process = function() {

                //

            };

            this.info = function() {

                return [
                    'MENU',
                    []
                ];

            };

        })();

        return menu;
        
    }
);