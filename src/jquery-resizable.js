/// <reference path="jquery.js" />
/*
jquery-resizable
Inspired By
RickStrahl/jquery-resizable
https://github.com/RickStrahl/jquery-resizable
Licensed under MIT License
*/
(function($, window, document, undefined) {

    var defaults = {
        // selector for handle that starts dragging
        handleSelector: null,
        // resize the width
        resizeWidth: true,
        // resize the height
        resizeHeight: true,
        // the side that the width resizing is relative to
        resizeWidthFrom: 'right',
        // the side that the height resizing is relative to
        resizeHeightFrom: 'bottom',
        // hook into start drag operation (event passed)
        onDragStart: null,
        // hook into stop drag operation (event passed)
        onDragEnd: null,
        // hook into each drag operation (event passed)
        onDrag: null,
        // disable touch-action on $handle
        // prevents browser level actions like forward back gestures
        touchActionNone: true
    }

    // The actual plugin constructor.
    function resizable(el, options) {

        this.options = $.extend(true, {}, defaults, options);
        this.$el = $(el);

        this._defaults = defaults;
        this._name = 'resizable';

        this.init();
    }

    // Initialize all parts of the plugin.
    $.extend(resizable.prototype, {
        init: function() {
            this.$handle = this.options.handleSelector ? this.$el.find(this.options.handleSelector) : this.$el;
            if (this.options.touchActionNone) this.$handle.css("touch-action", "none");
            this.$el.addClass("resizable");
            this.$handle.on('mousedown.rsz touchstart.rsz',  $.proxy(this.startDragging,this));
        },
        startDragging: function(e,v) {
            // Prevent dragging a ghost image in HTML5 / Firefox and maybe others
            if (e.preventDefault) {  e.preventDefault();  }

            startPos = this.getMousePos(e);
            startPos.width = parseInt(this.$el.width(), 10);
            startPos.height = parseInt(this.$el.height(), 10);

            this.startTransition = this.$el.css("transition");
            this.$el.css("transition", "none");

            if (this.options.onDragStart) {
                if (this.options.onDragStart(e) === false)
                    return;
            }


            $(document).on('mousemove.rsz', $.proxy(this.doDrag,this));
            $(document).on('mouseup.rsz', $.proxy(this.stopDragging,this));
            if (window.Touch || navigator.maxTouchPoints) {
                $(document).on('touchmove.rsz', $.proxy(this.doDrag,this));
                $(document).on('touchend.rsz', $.proxy(this.stopDragging,this));
            }
            $(document).on('selectstart.rsz', this.noop); // disable selection
        },
        noop: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        doDrag: function(e) {

            var pos = this.getMousePos(e),
                newWidth, newHeight;

            if (this.options.resizeWidthFrom === 'left')
                newWidth = startPos.width - pos.x + startPos.x;
            else
                newWidth = startPos.width + pos.x - startPos.x;

            if (this.options.resizeHeightFrom === 'top')
                newHeight = startPos.height - pos.y + startPos.y;
            else
                newHeight = startPos.height + pos.y - startPos.y;

            if (!this.options.onDrag || this.options.onDrag(e, this.$el, newWidth, newHeight, this.options) !== false) {
                if (this.options.resizeHeight)
                    this.$el.height(newHeight);

                if (this.options.resizeWidth)
                    this.$el.width(newWidth);
            }
        },
        stopDragging: function(e) {
            e.stopPropagation();
            e.preventDefault();

            $(document).off('mousemove.rsz');
            $(document).off('mouseup.rsz');

            if (window.Touch || navigator.maxTouchPoints) {
                $(document).off('touchmove.rsz');
                $(document).off('touchend.rsz');
            }
            $(document).off('selectstart.rsz');

            // reset changed values
            this.$el.css("transition", this.startTransition);

            if (this.options.onDragEnd)
                this.options.onDragEnd(e, this.$el, this.options);

            return false;
        },
        getMousePos: function(e) {
            var pos = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
            if (typeof e.clientX === "number") {
                pos.x = e.clientX;
                pos.y = e.clientY;
            } else if (e.originalEvent.touches) {
                pos.x = e.originalEvent.touches[0].clientX;
                pos.y = e.originalEvent.touches[0].clientY;
            } else
                return null;

            return pos;
        }
    });


    // A plugin wrapper around the constructor.
    // Pass `options` with all settings that are different from the default.
    // The attribute is used to prevent multiple instantiations of the plugin.
    $.fn.resizable = function(options) {
        var attribute = 'resizable';
        return this.each(function() {
            // Prevent against multiple instantiations.
            var instance = $.data(this, attribute);
            if (!instance) {
                instance = new resizable(this, options);
                $.data(this, attribute, instance);
            }
        });
    };


})(jQuery, window, document);
