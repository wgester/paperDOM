define(function(require, exports, module) {
    var Utility          = require('famous/utilities/Utility');
    var SequentialLayout = require('famous/views/SequentialLayout');
    var ViewSequence     = require('famous/core/ViewSequence');
    var Transitionable   = require('famous/transitions/Transitionable');
    var RenderNode       = require('famous/core/RenderNode');
    var Modifier         = require('famous/core/Modifier');
    var Transform        = require('famous/core/Transform');
    
    var Hinge            = require('famous/modifiers/Hinge');

  
    function AccordionLayout(options) {
        if (options) {
            if (options.direction) options.direction = AccordionLayout.dictionary[options.direction];
            if (options.start) options.start = AccordionLayout.dictionary[options.start];
        }

        SequentialLayout.apply(this, options);
        this.setOptions(AccordionLayout.DEFAULT_OPTIONS);

        if (options) this.setOptions(options);

        this._items = [];
        this._renderables = [];
        
        if (!this.options.start) this.angle = this.options.direction ? new Transitionable(Math.PI/2) : new Transitionable(-Math.PI/2);
        else this.angle = new Transitionable(0);
    };

    AccordionLayout.dictionary = {
        1: 1,
        'y': 0,
        'x': 1,
        'closed': 0,
        'open': 1
    };

    AccordionLayout.DEFAULT_OPTIONS = {
        direction: Utility.Direction.Y,
        start: 0,
        transition: false
    };

    _attachModifiers = function() {
        for (var i = 0; i < this._renderables.length; i++) {
            this._renderables[i].sizeModifier.sizeFrom(function(i) {
                var newSize = this._renderables[i].size[this.options.direction] * Math.cos(this.angle.get());
                return this.options.direction ? [undefined, newSize] : [newSize, undefined];
            }.bind(this, i));
            this._renderables[i].sizeModifier.transformFrom(function(i) {
                return Transform.rotateZ(i * 5 *  this.angle.get()/ 75)
            }.bind(this, i));
            this._renderables[i].sizeModifier3.transformFrom(function(i) {
                return Transform.skewY(i * 0.00175 * this.angle.get())
            }.bind(this, i));
            this._renderables[i].sizeModifier2.transformFrom(function(i) {
                return Transform.scale(10 * Math.abs(this.angle.get()) + 1.4, 1, 1)
            }.bind(this, i));
            this._renderables[i].sizeModifier.setOrigin([0.5, 0.5]);
        }

    };

    AccordionLayout.prototype = Object.create(SequentialLayout.prototype);

    AccordionLayout.prototype.sequenceFrom = function(items) {
        if (items instanceof Array) {
            for (var i = 0; i < items.length; i++) {
                if (i % 2) {
                    var hingeModifier = new Hinge({
                        angle: this.angle.get(), 
                        side: 1, 
                        transition: this.options.transition
                    });
                    var hingedItem = new RenderNode();
                    var sizeModifier = new Modifier();
                    var sizeModifier2 = new Modifier();
                    var sizeModifier3 = new Modifier();
                    hingedItem.add(sizeModifier).add(sizeModifier2).add(sizeModifier3).add(items[i]);
                } else {
                    var hingeModifier = new Hinge({
                        angle: -this.angle.get(), 
                        side: 3,
                        transition: this.options.transition
                    });
                    var hingedItem = new RenderNode();
                    var sizeModifier = new Modifier();
                    var sizeModifier2 = new Modifier();
                    var sizeModifier3 = new Modifier();
                    hingedItem.add(sizeModifier).add(sizeModifier2).add(sizeModifier3).add(items[i]);
                }
                this._renderables.push({
                    size: items[i].getSize(),
                    sizeModifier: sizeModifier,
                    sizeModifier2: sizeModifier2,
                    sizeModifier3: sizeModifier3,
                    hinge: hingeModifier
                });
                this._items.push(hingedItem);
            }
            this._items = new ViewSequence(this._items)
        }
        _attachModifiers.call(this);
        return this;
    };

    AccordionLayout.prototype.open = function() {
        for (var i = 0; i < this._renderables.length; i++) {
            this._renderables[i].hinge.setAngle(0);
        }
        this.angle.set(0, this.options.transition);
    };

    AccordionLayout.prototype.close = function() {
        for (var i = 0; i < this._renderables.length; i++) {
            if (i % 2) this._renderables[i].hinge.setAngle(Math.PI/2);
            else this._renderables[i].hinge.setAngle(-Math.PI/2);
        }
        this.angle.set(Math.PI/2, this.options.transition);
    };

    AccordionLayout.prototype.setAngle = function(angle) {
        for (var i = 0; i < this._renderables.length; i++) {
            if (i % 2) this._renderables[i].hinge.setAngle(-angle);
            else this._renderables[i].hinge.setAngle(angle);
        }
        this.angle.set(angle);
    };

    AccordionLayout.prototype.size = function() {
        var size = 0;
        for (var i = 0; i < this._renderables.length; i++) {
            size += this._renderables[i].size[this.options.direction];
        }
        size = size * Math.cos(this.angle.get());
        return size;
    }

    AccordionLayout.prototype.setSize = function(size) {
        var absSize = 0;
        for (var i = 0; i < this._renderables.length; i++) {
            absSize += this._renderables[i].size[this.options.direction];
        }
        var angle = Math.acos(size / absSize) - Math.PI/2;
        this.setAngle(angle);
    }

    module.exports = AccordionLayout;
});