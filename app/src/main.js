/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var AccordionLayout = require('./AccordionLayout');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var MouseSync = require('famous/inputs/MouseSync');
    var EventHandler = require('famous/core/EventHandler');
    var Modifier = require('famous/core/Modifier');

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    var pics = [];
    var open = false;
    var mouseSync = new MouseSync();

    this._eventInput = new EventHandler();
    this._eventOutput = new EventHandler();
    Engine.pipe(mouseSync);
    mouseSync.pipe(this._eventInput);
    var size = 0;
    this._eventInput.on('update', function(event) {
        size += event.delta[0];
        if (size > 500) {
            size = -500;
        }
        if (size < -500) {
            size = 500;
        }
        a.setSize(size);
    }.bind(this));
    var tick = 1;
    // Engine.on('prerender', function() {
    //     size += tick;
    //     if (size > 50) {
    //         tick *= -1;
    //     }
    //     if (size < 0) {
    //         tick *= -1;
    //     }
    //     a.setSize(size);
    // })
    var a = new AccordionLayout({direction: 'y'});

    for (var i = 0; i < 300; i++) {
        var container = new ContainerSurface({
            origin: [0.5, 0.5],
            align: [0.5, 0.5],
            size: [600 /300, 350],
            properties: {
                overflow: 'hidden'
            },
            // classes: ['backface-visible']
        });

        var mod = new StateModifier({
            transform: Transform.translate(-600/300 * i, 0, 1 * i)
        });
        var rotateMod = new Modifier({
            align: [0.5, 0.5],
            origin: [0.5, 0.5],
            transform: function(i, a) {
                return Transform.rotateX(i * a.angle.get())
            }.bind(this, i, a)
        });
        var pic = new ImageSurface({
            content: '/content/images/colbert.gif',
            size: [600, 350],
            // classes: ['backface-visible']
        });
        container.add(mod).add(pic);

        pics.push(container);
    }

    a.sequenceFrom(pics);
    a.setSize(size);
    window.a = a

    mainContext.add(a);
    mainContext.setPerspective(1000)
});
