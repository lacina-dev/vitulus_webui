class OrbitControlsOrtho extends THREE.EventDispatcher {

	  /**
	   * Behaves like THREE.OrbitControls, but uses right-handed coordinates and z as up vector.
	   *
	   * @constructor
	   * @param scene - the global scene to use
	   * @param camera - the camera to use
	   * @param userZoomSpeed (optional) - the speed for zooming
	   * @param userRotateSpeed (optional) - the speed for rotating
	   * @param autoRotate (optional) - if the orbit should auto rotate
	   * @param autoRotateSpeed (optional) - the speed for auto rotating
	   * @param displayPanAndZoomFrame - whether to display a frame when panning/zooming
	   *                                 (defaults to true)
	   * @param lineTypePanAndZoomFrame - line type for the frame that is displayed when
	   *                                  panning/zooming. Only has effect when
	   *                                  displayPanAndZoomFrame is set to true.
	   */
	  constructor(options) {
	    super();
	    var that = this;
	    options = options || {};
	    var scene = options.scene;
	    this.camera = options.camera;
	    this.center = new THREE.Vector3();
	    this.userZoom = true;
	    this.userZoomSpeed = options.userZoomSpeed || 1.0;
	    this.userRotate = true;
	    this.userRotateSpeed = options.userRotateSpeed || 1.0;
	    this.autoRotate = options.autoRotate;
	    this.autoRotateSpeed = options.autoRotateSpeed || 2.0;
	    this.displayPanAndZoomFrame = (options.displayPanAndZoomFrame === undefined) ?
	        true :
	        !!options.displayPanAndZoomFrame;
	    this.lineTypePanAndZoomFrame = options.dashedPanAndZoomFrame || 'full';
	    // In ROS, z is pointing upwards
	    this.camera.up = new THREE.Vector3(0, 0, 1);

	    // internals
	    var pixelsPerRound = 1800;
	    var touchMoveThreshold = 10;
	    var rotateStart = new THREE.Vector2();
	    var rotateEnd = new THREE.Vector2();
	    var rotateDelta = new THREE.Vector2();
	    var zoomStart = new THREE.Vector2();
	    var zoomEnd = new THREE.Vector2();
	    var zoomDelta = new THREE.Vector2();
	    var moveStartCenter = new THREE.Vector3();
	    var moveStartNormal = new THREE.Vector3();
	    var moveStartPosition = new THREE.Vector3();
	    var moveStartIntersection = new THREE.Vector3();
	    var moveCamLeft = 0;
	    var moveCamRight = 0;
	    var moveCamTop = 0;
	    var moveCamBottom = 0;
	    var moveStart = new THREE.Vector3();
	    var touchStartPosition = new Array(2);
	    var touchMoveVector = new Array(2);
	    this.phiDelta = 0;
	    this.thetaDelta = 0;
	    this.scale = 1;
	    this.lastPosition = new THREE.Vector3();
	    // internal states
	    var STATE = {
	      NONE : -1,
	      ROTATE : 0,
	      ZOOM : 1,
	      MOVE : 2
	    };
	    var state = STATE.NONE;

	    this.axes = new ROS3D.Axes({
	      shaftRadius : 0.025,
	      headRadius : 0.07,
	      headLength : 0.2,
	      lineType: this.lineTypePanAndZoomFrame
	    });
	    if (this.displayPanAndZoomFrame) {
	      // initially not visible
	      scene.add(this.axes);
	      this.axes.traverse(function(obj) {
	        obj.visible = false;
	      });
	    }

	    /**
	     * Handle the mousedown 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onMouseDown(event3D) {
            console.log("this");
            console.log(this);
	      var event = event3D.domEvent;
	      event.preventDefault();

	      switch (event.button) {
	        case 0:
	          state = STATE.ROTATE;
	          rotateStart.set(event.clientX, event.clientY);
	          break;
	        case 1:
	          state = STATE.MOVE;

			  console.log(this.camera.matrix);
	          moveStartNormal = new THREE.Vector3(0, 0, 1);
	          var rMat = new THREE.Matrix4().extractRotation(this.camera.matrix);
	          moveStartNormal.applyMatrix4(rMat);

	          moveStartCenter = that.center.clone();
	          moveStartPosition = that.camera.position.clone();
	          moveStartIntersection = intersectViewPlane(event3D.mouseRay,
	                                                     moveStartCenter,
	                                                     moveStartNormal);
			  moveStart = event3D.mouseRay.origin.clone();
			  moveCamLeft = that.camera.left;
			  moveCamRight = that.camera.right;
			  moveCamTop = that.camera.top;
			  moveCamBottom = that.camera.bottom;

	          break;
	        case 2:
	          state = STATE.ZOOM;
	          zoomStart.set(event.clientX, event.clientY);
	          break;
	      }

	      this.showAxes();
	    }

	    /**
	     * Handle the mousemove 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onMouseMove(event3D) {
	      var event = event3D.domEvent;
	      if (state === STATE.ROTATE) {

	        rotateEnd.set(event.clientX, event.clientY);
	        rotateDelta.subVectors(rotateEnd, rotateStart);

	        that.rotateLeft(2 * Math.PI * rotateDelta.x / pixelsPerRound * that.userRotateSpeed);
	        that.rotateUp(2 * Math.PI * rotateDelta.y / pixelsPerRound * that.userRotateSpeed);

	        rotateStart.copy(rotateEnd);
	        this.showAxes();
	      } else if (state === STATE.ZOOM) {
	        zoomEnd.set(event.clientX, event.clientY);
	        zoomDelta.subVectors(zoomEnd, zoomStart);

	        if (zoomDelta.y > 0) {
	          that.zoomIn();
	        } else {
	          that.zoomOut();
	        }

	        zoomStart.copy(zoomEnd);
	        this.showAxes();

	      } else if (state === STATE.MOVE) {
	        // var intersection = intersectViewPlane(event3D.mouseRay, that.center, moveStartNormal);
	        var intersection = intersectViewPlane(event3D.mouseRay, moveStart, moveStartNormal);

	        if (!intersection) {
	          return;
	        }

	        var delta = new THREE.Vector3().subVectors(moveStartIntersection.clone(), intersection.clone());
	        var deltaO = new THREE.Vector3().subVectors(moveStart, event3D.mouseRay.origin);

	        // that.center.addVectors(moveStartCenter.clone(), delta.clone());
	        // that.camera.position.addVectors(moveStartPosition.clone(), delta.clone());
	        // that.update();
	        // that.camera.updateMatrixWorld();
	        // this.showAxes();
			console.log("this.camera.position");
			console.log(event3D.mouseRay.origin);
			console.log(intersection);
			console.log(delta);
			console.log(scene);
			const width = Math.abs(this.camera.left - this.camera.right);
			const height = Math.abs(this.camera.top - this.camera.bottom);
			console.log(width);
			console.log(height);
			// this.camera.left = (-width / 2) + event3D.mouseRay.origin.y;
			// this.camera.right = (width / 2) + event3D.mouseRay.origin.y;
			// this.camera.top = (height / 2) + event3D.mouseRay.origin.x;
			// this.camera.bottom = (-height / 2) + event3D.mouseRay.origin.x;
			// this.camera.left = moveCamLeft + delta.y;
			// this.camera.right = moveCamRight + delta.y;
			// this.camera.top = moveCamTop - delta.x;
			// this.camera.bottom = moveCamBottom - delta.x;
			//
			// this.camera.updateProjectionMatrix();
	      }
	    }

	    /**
	     * Used to track the movement during camera movement.
	     *
	     * @param mouseRay - the mouse ray to intersect with
	     * @param planeOrigin - the origin of the plane
	     * @param planeNormal - the normal of the plane
	     * @returns the intersection
	     */
	    function intersectViewPlane(mouseRay, planeOrigin, planeNormal) {

	      var vector = new THREE.Vector3();
	      var intersection = new THREE.Vector3();

	      vector.subVectors(planeOrigin, mouseRay.origin);
	      var dot = mouseRay.direction.dot(planeNormal);

	      // bail if ray and plane are parallel
	      if (Math.abs(dot) < mouseRay.precision) {
	        return null;
	      }

	      // calc distance to plane
	      var scalar = planeNormal.dot(vector) / dot;

	      intersection = mouseRay.direction.clone().multiplyScalar(scalar);
	      return intersection;
	    }

	    /**
	     * Handle the mouseup 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onMouseUp(event3D) {
	      if (!that.userRotate) {
	        return;
	      }

	      state = STATE.NONE;
	    }

	    /**
	     * Handle the mousewheel 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onMouseWheel(event3D) {
	      if (!that.userZoom) {
	        return;
	      }

	      var event = event3D.domEvent;
	      // wheelDelta --> Chrome, detail --> Firefox
	      var delta;
	      if (typeof (event.wheelDelta) !== 'undefined') {
	        delta = event.wheelDelta;
	      } else {
	        delta = -event.detail;
	      }
	      if (delta > 0) {
	        that.zoomIn();
	      } else {
	        that.zoomOut();
	      }

	      this.showAxes();
	    }

	    /**
	     * Handle the touchdown 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onTouchDown(event3D) {
	      var event = event3D.domEvent;
	      switch (event.touches.length) {
	        case 1:
	          state = STATE.ROTATE;
	          rotateStart.set(event.touches[0].pageX - window.scrollX,
	                          event.touches[0].pageY - window.scrollY);
	          break;
	        case 2:
	          state = STATE.NONE;
	          /* ready for move */
	          moveStartNormal = new THREE.Vector3(0, 0, 1);
	          var rMat = new THREE.Matrix4().extractRotation(this.camera.matrix);
	          moveStartNormal.applyMatrix4(rMat);
	          moveStartCenter = that.center.clone();
	          moveStartPosition = that.camera.position.clone();
	          moveStartIntersection = intersectViewPlane(event3D.mouseRay,
	                                                     moveStartCenter,
	                                                     moveStartNormal);
	          touchStartPosition[0] = new THREE.Vector2(event.touches[0].pageX,
	                                                    event.touches[0].pageY);
	          touchStartPosition[1] = new THREE.Vector2(event.touches[1].pageX,
	                                                    event.touches[1].pageY);
	          touchMoveVector[0] = new THREE.Vector2(0, 0);
	          touchMoveVector[1] = new THREE.Vector2(0, 0);
	          break;
	      }

	      this.showAxes();

	      event.preventDefault();
	    }

	    /**
	     * Handle the touchmove 3D event.
	     *
	     * @param event3D - the 3D event to handle
	     */
	    function onTouchMove(event3D) {
	      var event = event3D.domEvent;
	      if (state === STATE.ROTATE) {

	        rotateEnd.set(event.touches[0].pageX - window.scrollX, event.touches[0].pageY - window.scrollY);
	        rotateDelta.subVectors(rotateEnd, rotateStart);

	        that.rotateLeft(2 * Math.PI * rotateDelta.x / pixelsPerRound * that.userRotateSpeed);
	        that.rotateUp(2 * Math.PI * rotateDelta.y / pixelsPerRound * that.userRotateSpeed);

	        rotateStart.copy(rotateEnd);
	        this.showAxes();
	      } else {
	        touchMoveVector[0].set(touchStartPosition[0].x - event.touches[0].pageX,
	                               touchStartPosition[0].y - event.touches[0].pageY);
	        touchMoveVector[1].set(touchStartPosition[1].x - event.touches[1].pageX,
	                               touchStartPosition[1].y - event.touches[1].pageY);
	        if (touchMoveVector[0].lengthSq() > touchMoveThreshold &&
	            touchMoveVector[1].lengthSq() > touchMoveThreshold) {
	          touchStartPosition[0].set(event.touches[0].pageX,
	                                    event.touches[0].pageY);
	          touchStartPosition[1].set(event.touches[1].pageX,
	                                    event.touches[1].pageY);
	          if (touchMoveVector[0].dot(touchMoveVector[1]) > 0 &&
	              state !== STATE.ZOOM) {
	            state = STATE.MOVE;
	          } else if (touchMoveVector[0].dot(touchMoveVector[1]) < 0 &&
	                     state !== STATE.MOVE) {
	            state = STATE.ZOOM;
	          }
	          if (state === STATE.ZOOM) {
	            var tmpVector = new THREE.Vector2();
	            tmpVector.subVectors(touchStartPosition[0],
	                                 touchStartPosition[1]);
	            if (touchMoveVector[0].dot(tmpVector) < 0 &&
	                touchMoveVector[1].dot(tmpVector) > 0) {
	              that.zoomOut();
	            } else if (touchMoveVector[0].dot(tmpVector) > 0 &&
	                       touchMoveVector[1].dot(tmpVector) < 0) {
	              that.zoomIn();
	            }
	          }
	        }
	        if (state === STATE.MOVE) {
	          var intersection = intersectViewPlane(event3D.mouseRay,
	                                                that.center,
	                                                moveStartNormal);
	          if (!intersection) {
	            return;
	          }
	          var delta = new THREE.Vector3().subVectors(moveStartIntersection.clone(),
	                                                     intersection.clone());
	          that.center.addVectors(moveStartCenter.clone(), delta.clone());
	          that.camera.position.addVectors(moveStartPosition.clone(), delta.clone());
	          console.log("this.camera.position");
			  console.log(intersection);
			  that.update();
	          that.camera.updateMatrixWorld();

	        }

	        this.showAxes();

	        event.preventDefault();
	      }
	    }

	    function onTouchEnd(event3D) {
	      var event = event3D.domEvent;
	      if (event.touches.length === 1 &&
	          state !== STATE.ROTATE) {
	        state = STATE.ROTATE;
	        rotateStart.set(event.touches[0].pageX - window.scrollX,
	                        event.touches[0].pageY - window.scrollY);
	      }
	      else {
	          state = STATE.NONE;
	      }
	    }

	    // add event listeners
	    this.addEventListener('mousedown', onMouseDown);
	    this.addEventListener('mouseup', onMouseUp);
	    this.addEventListener('mousemove', onMouseMove);
	    this.addEventListener('touchstart', onTouchDown);
	    this.addEventListener('touchmove', onTouchMove);
	    this.addEventListener('touchend', onTouchEnd);
	    // Chrome/Firefox have different events here
	    this.addEventListener('mousewheel', onMouseWheel);
	    this.addEventListener('DOMMouseScroll', onMouseWheel);
	  };

	  /**
	   * Display the main axes for 1 second.
	   */
	  showAxes() {
	    var that = this;

	    this.axes.traverse(function(obj) {
	      obj.visible = true;
	    });
	    if (this.hideTimeout) {
	      clearTimeout(this.hideTimeout);
	    }
	    this.hideTimeout = setTimeout(function() {
	      that.axes.traverse(function(obj) {
	        obj.visible = false;
	      });
	      that.hideTimeout = false;
	    }, 1000);
	  };

	  /**
	   * Rotate the camera to the left by the given angle.
	   *
	   * @param angle (optional) - the angle to rotate by
	   */
	  rotateLeft(angle) {
	    if (angle === undefined) {
	      angle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	    }
	    this.thetaDelta -= angle;
	  };

	  /**
	   * Rotate the camera to the right by the given angle.
	   *
	   * @param angle (optional) - the angle to rotate by
	   */
	  rotateRight(angle) {
	    if (angle === undefined) {
	      angle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	    }
	    this.thetaDelta += angle;
	  };

	  /**
	   * Rotate the camera up by the given angle.
	   *
	   * @param angle (optional) - the angle to rotate by
	   */
	  rotateUp(angle) {
	    if (angle === undefined) {
	      angle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	    }
	    this.phiDelta -= angle;
	  };

	  /**
	   * Rotate the camera down by the given angle.
	   *
	   * @param angle (optional) - the angle to rotate by
	   */
	  rotateDown(angle) {
	    if (angle === undefined) {
	      angle = 2 * Math.PI / 60 / 60 * this.autoRotateSpeed;
	    }
	    this.phiDelta += angle;
	  };

	  /**
	   * Zoom in by the given scale.
	   *
	   * @param zoomScale (optional) - the scale to zoom in by
	   */
	  zoomIn(zoomScale) {
	    if (zoomScale === undefined) {
	      zoomScale = Math.pow(0.95, this.userZoomSpeed);
	    }
	    this.scale /= zoomScale;
		console.log(this.scale);
		console.log(this.camera.left);
		const scale = this.scale;
		this.camera.left = this.camera.left * scale;
		this.camera.right = this.camera.right * scale;
		this.camera.top = this.camera.top * scale;
		this.camera.bottom = this.camera.bottom * scale;
		this.camera.updateProjectionMatrix();
	  };

	  /**
	   * Zoom out by the given scale.
	   *
	   * @param zoomScale (optional) - the scale to zoom in by
	   */
	  zoomOut(zoomScale) {
	    if (zoomScale === undefined) {
	      zoomScale = Math.pow(0.95, this.userZoomSpeed);
	    }
	    this.scale *= zoomScale;
		console.log(this.scale);
		console.log(this.camera.left);
		const scale = this.scale;
		this.camera.left = this.camera.left * scale;
		this.camera.right = this.camera.right * scale;
		this.camera.top = this.camera.top * scale;
		this.camera.bottom = this.camera.bottom * scale;
		this.camera.updateProjectionMatrix();
	  };

	  /**
	   * Update the camera to the current settings.
	   */
	  update() {
	    // x->y, y->z, z->x
	    var position = this.camera.position;
	    var offset = position.clone().sub(this.center);

	    // angle from z-axis around y-axis
	    var theta = Math.atan2(offset.y, offset.x);

	    // angle from y-axis
	    var phi = Math.atan2(Math.sqrt(offset.y * offset.y + offset.x * offset.x), offset.z);

	    if (this.autoRotate) {
	      this.rotateLeft(2 * Math.PI / 60 / 60 * this.autoRotateSpeed);
	    }

	    theta += this.thetaDelta;
	    phi += this.phiDelta;

	    // restrict phi to be between EPS and PI-EPS
	    var eps = 0.000001;
	    phi = Math.max(eps, Math.min(Math.PI - eps, phi));

	    var radius = offset.length();
	    offset.set(
	      radius * Math.sin(phi) * Math.cos(theta),
	      radius * Math.sin(phi) * Math.sin(theta),
	      radius * Math.cos(phi)
	    );
	    offset.multiplyScalar(this.scale);

	    position.copy(this.center).add(offset);

	    this.camera.lookAt(this.center);

	    radius = offset.length();
	    this.axes.position.copy(this.center);
	    this.axes.scale.set(radius * 0.05, radius * 0.05, radius * 0.05);
	    this.axes.updateMatrixWorld(true);

	    this.thetaDelta = 0;
	    this.phiDelta = 0;
	    this.scale = 1;

	    if (this.lastPosition.distanceTo(this.camera.position) > 0) {
	      this.dispatchEvent({
	        type : 'change'
	      });
	      this.lastPosition.copy(this.camera.position);
	    }
		// console.log(this.camera.position);
		// if (this.camera.position.x > 0.00001 || this.camera.position.x < -0.00001){
		// 	const move_vector = this.camera.position.clone();
		// 	this.camera.left = this.camera.left + move_vector.x;
		// 	this.camera.right = this.camera.right + move_vector.x;
		// 	this.camera.top = this.camera.top + move_vector.y;
		// 	this.camera.bottom = this.camera.bottom + move_vector.y;
		// 	this.camera.updateProjectionMatrix();
		//   }
	  };
	}

	/**
	 * @fileOverview
	 * @author David Gossow - dgossow@willowgarage.com
	 * @author Russell Toris - rctoris@wpi.edu
	 * @author Jihoon Lee - jihoonlee.in@gmail.com
	 */


class ViewerOrtho {

	  /**
	   * A Viewer can be used to render an interactive 3D scene to a HTML5 canvas.
	   *
	   * @constructor
	   * @param options - object with following keys:
	   *
	   *  * divID - the ID of the div to place the viewer in
	   *  * elem - the elem to place the viewer in (overrides divID if provided)
	   *  * width - the initial width, in pixels, of the canvas
	   *  * height - the initial height, in pixels, of the canvas
	   *  * background (optional) - the color to render the background, like '#efefef'
	   *  * alpha (optional) - the alpha of the background
	   *  * antialias (optional) - if antialiasing should be used
	   *  * intensity (optional) - the lighting intensity setting to use
	   *  * cameraPosition (optional) - the starting position of the camera
	   *  * displayPanAndZoomFrame (optional) - whether to display a frame when
	   *  *                                     panning/zooming. Defaults to true.
	   *  * lineTypePanAndZoomFrame - line type for the frame that is displayed when
	   *  *                           panning/zooming. Only has effect when
	   *  *                           displayPanAndZoomFrame is set to true.
	   */
	  constructor(options) {
	    options = options || {};
	    var divID = options.divID;
	    var elem = options.elem;
	    var width = options.width;
	    var height = options.height;
	    var background = options.background || '#111111';
	    var antialias = options.antialias;
	    var intensity = options.intensity || 0.66;
	    var near = options.near || 0.01;
	    var far = options.far || 1000;
	    var alpha = options.alpha || 1.0;
	    var cameraPosition = options.cameraPose || {
	      x : 3,
	      y : 3,
	      z : 3
	    };
	    var cameraZoomSpeed = options.cameraZoomSpeed || 0.5;
	    var displayPanAndZoomFrame = (options.displayPanAndZoomFrame === undefined) ? true : !!options.displayPanAndZoomFrame;
	    var lineTypePanAndZoomFrame = options.lineTypePanAndZoomFrame || 'full';

	    // create the canvas to render to
	    this.renderer = new THREE.WebGLRenderer({
	      antialias : antialias,
	      alpha: true
	    });
	    this.renderer.setClearColor(parseInt(background.replace('#', '0x'), 16), alpha);
	    this.renderer.sortObjects = false;
	    this.renderer.setSize(width, height);
	    this.renderer.shadowMap.enabled = false;
	    this.renderer.autoClear = false;

	    // create the global scene
	    this.scene = new THREE.Scene();
	    // create the global camera
	    // this.camera = new THREE.PerspectiveCamera(40, width / height, near, far);
	    this.camera = new THREE.OrthographicCamera( -width / 2,
                                                    width / 2,
                                                    height / 2,
                                                    -height / 2 ,
                                                    -1, 1000 );
	    this.camera.position.x = cameraPosition.x;
	    this.camera.position.y = cameraPosition.y;
	    this.camera.position.z = cameraPosition.z;
	    // add controls to the camera
	    this.cameraControls = new OrbitControlsOrtho({
	      scene : this.scene,
	      camera : this.camera,
	      displayPanAndZoomFrame : displayPanAndZoomFrame,
	      lineTypePanAndZoomFrame: lineTypePanAndZoomFrame
	    });
	    this.cameraControls.userZoomSpeed = cameraZoomSpeed;

	    // lights
	    this.scene.add(new THREE.AmbientLight(0x555555));
	    this.directionalLight = new THREE.DirectionalLight(0xffffff, intensity);
	    this.scene.add(this.directionalLight);

	    // propagates mouse events to three.js objects
	    this.selectableObjects = new THREE.Group();
	    this.scene.add(this.selectableObjects);
	    var mouseHandler = new ROS3D.MouseHandler({
	      renderer : this.renderer,
	      camera : this.camera,
	      rootObject : this.selectableObjects,
	      fallbackTarget : this.cameraControls
	    });

	    // highlights the receiver of mouse events
	    this.highlighter = new ROS3D.Highlighter({
	      mouseHandler : mouseHandler
	    });

	    this.stopped = true;
	    this.animationRequestId = undefined;

	    // add the renderer to the page
	    var node = elem || document.getElementById(divID);
	    node.appendChild(this.renderer.domElement);

	    // begin the render loop
	    this.start();
	  };

	  /**
	   *  Start the render loop
	   */
	  start(){
	    this.stopped = false;
	    this.draw();
	  };

	  /**
	   * Renders the associated scene to the viewer.
	   */
	  draw(){
	    if(this.stopped){
	      // Do nothing if stopped
	      return;
	    }

	    // update the controls
	    this.cameraControls.update();

	    // put light to the top-left of the camera
	    // BUG: position is a read-only property of DirectionalLight,
	    // attempting to assign to it either does nothing or throws an error.
	    //this.directionalLight.position = this.camera.localToWorld(new THREE.Vector3(-1, 1, 0));
	    this.directionalLight.position.normalize();

	    // set the scene
	    this.renderer.clear(true, true, true);
	    this.renderer.render(this.scene, this.camera);
	    this.highlighter.renderHighlights(this.scene, this.renderer, this.camera);

	    // draw the frame
	    this.animationRequestId = requestAnimationFrame(this.draw.bind(this));
	  };

	  /**
	   *  Stop the render loop
	   */
	  stop(){
	    if(!this.stopped){
	      // Stop animation render loop
	      cancelAnimationFrame(this.animationRequestId);
	    }
	    this.stopped = true;
	  };

	  /**
	   * Add the given THREE Object3D to the global scene in the viewer.
	   *
	   * @param object - the THREE Object3D to add
	   * @param selectable (optional) - if the object should be added to the selectable list
	   */
	  addObject(object, selectable) {
	    if (selectable) {
	      this.selectableObjects.add(object);
	    } else {
	      this.scene.add(object);
	    }
	  };

	  /**
	   * Resize 3D viewer
	   *
	   * @param width - new width value
	   * @param height - new height value
	   */
	  resize(width, height) {
	    this.camera.aspect = width / height;
	    this.camera.updateProjectionMatrix();
	    this.renderer.setSize(width, height);
	  };
	}

window.onload = function () {
    const ros = new ROSLIB.Ros({url: "ws://" + location.hostname + ":9090"});

    const viewer = new ViewerOrtho({
        divID: 'viewer',
        ros: ros,
        width: window.innerWidth,
        height: window.innerHeight,
		near : 0.2,
		far : 100000,
		antialias : true,
		intensity : 1.0,
		alpha : 1.0,
		background : '#1e2f38',  // 1e2f38
		cameraPose : {  x : 0, y : 0, z : 1 },
		displayPanAndZoomFrame : false
    });
	// viewer.camera.fov = 1;
	// viewer.cameraControls.rotateDown();

	  const tfClientMap = new ROSLIB.TFClient({
        ros: ros,
        angularThres: 0.01,
        transThres: 0.01,
        rate: 10.0,
        fixedFrame: '/map'
    });

	var imClient = new ROS3D.InteractiveMarkerClient({
      ros : ros,
      tfClient : tfClientMap,
      topic : '/interactive_marker',
      camera : viewer.camera,
      rootObject : viewer.selectableObjects
    });



    ////////// send interactive marker goal
    // var interactiveMarkerGoalTopic = new ROSLIB.Topic({
    //     ros : ros,
    //     name : '/navi_manager/interactive_marker_goal',
    //     messageType : 'std_msgs/String'
    // });
	//
    // interactiveMarkerGoalTopic.advertise();
    // goal_btn.disabled = true;
    // goal_btn.onclick = function() {
    //     console.log('Sending interactive marker goal.');
    //     var interactiveMarkerGoalMsg = new ROSLIB.Message({
    //         data : 'interactiveGoal',
    //     });
    //     interactiveMarkerGoalTopic.publish(interactiveMarkerGoalMsg);
    // };

    ////////// send cancel goal
    // var cancelGoalTopic = new ROSLIB.Topic({
    //     ros : ros,
    //     // name : '/move_base_flex/move_base/cancel',
    //     name : '/move_base_flex/exe_path/cancel',
    //     messageType : 'actionlib_msgs/GoalID'
    // });
	//
    // cancelGoalTopic.advertise();

//     cancel_goal_btn.onclick = function() {
//         console.log('Cancel goal.');
//         var cancelGoalMsg = new ROSLIB.Message({
// //            data : 'interactiveGoal',
//         });
//         cancelGoalTopic.publish(cancelGoalMsg);
//     };



    // hide_marker_btn.textContent = 'Show marker';
    // imClient.rootObject.visible = false;



    // hide_marker_btn.onclick = function() {
    //     if (hide_marker_btn.textContent == 'Hide marker'){
    //         imClient.rootObject.visible = false;
    //         hide_marker_btn.textContent = 'Show marker'
    //     }else{
    //         imClient.rootObject.visible = true;
    //         hide_marker_btn.textContent = 'Hide marker'
    //     }
    //     console.log(imClient);
    //     imClient.rootObject.visible = false;
    // };

    ////////// click on map publisher
    var newInteractiveMarkerTopic = new ROSLIB.Topic({
        ros : ros,
        name : '/navi_manager/new_interactive_marker',
        messageType : 'geometry_msgs/Pose'
    });
    newInteractiveMarkerTopic.advertise();

    viewer.cameraControls.addEventListener('touchstart', function(event3d) {
		console.log("event3d");
		console.log(event3d);
       if (true){
           console.log(event3d.mouseRay);
           var map_x = event3d.mouseRay.origin.x + (event3d.mouseRay.direction.x * event3d.mouseRay.origin.z);
           var map_y = event3d.mouseRay.origin.y + (event3d.mouseRay.direction.y * event3d.mouseRay.origin.z);
    //       console.log('x: ' + map_x + '  y: ' + map_y);
            var newInteractiveMarkerMsg = new ROSLIB.Message({
                position : {
                          x : map_x,
                          y : map_y,
                          z : 0
                        },
                        orientation : {
                          x : 0.0,
                          y : 0.0,
                          z : 0.0,
                          w : 1.0
                        }

            });
            newInteractiveMarkerTopic.publish(newInteractiveMarkerMsg);
            imClient.rootObject.visible = true;
            // goal_btn.disabled = false;
        };
    });


	// viewer.cameraControls.addEventListener('mousedown', function(event3d) {
    //         console.log("mousedown");
    //         console.log(event3d);
    //     });

	// viewer.cameraControls.addEventListener('touchstart', function(event3d) {
    //         console.log("touchstart");
    //         console.log(event3d);
    //     });

    // // Custom orthographic camera
    // function OrthographicCamera(options) {
    //     THREE.OrthographicCamera.call(this, options.left, options.right, options.top, options.bottom, options.near, options.far);
    //     // this.up.set(0, 0, 1); // Set the up vector for Three.js
    // }
	//
    // OrthographicCamera.prototype = Object.create(THREE.OrthographicCamera.prototype);
    // OrthographicCamera.prototype.constructor = OrthographicCamera;
	//
    // viewer.camera = new OrthographicCamera({
    //     left: -10,
    //     right: 10,
    //     top: 10,
    //     bottom: -10,
    //     near: 0.1,
    //     far: 1000
    // });

    // Create orbit controls
    // const orbitControls = new ROS3D.OrbitControls({
    //     camera: viewer.camera,
    //     scene: viewer.scene,
    // });
    // viewer.cameraControls = orbitControls;



    var v0 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.083});
    var v1 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.082});
    var v2 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.081});
    var v3 = new ROSLIB.Vector3({x: 0, y: 0, z: -0.08});
    var q1 = new ROSLIB.Quaternion({x: 0.0, y: 0.0, z: 0.0, w: 0.0});
    var z_offset_map = new ROSLIB.Pose({position: v1, orientation: q1});
    var z_offset_map2 = new ROSLIB.Pose({position: v0, orientation: q1});
    var z_offset_glob_cost = new ROSLIB.Pose({position: v2, orientation: q1});
    var z_offset_loc_cost = new ROSLIB.Pose({position: v3, orientation: q1});


    var gridClient = new ROS3D.OccupancyGridClient({
        ros: ros,
        tfClient: tfClientMap,
        rootObject: viewer.scene,
        continuous: true,
        topic: '/rtabmap/grid_map',
        // topic: '/map_assembled',
        // topic: '/web_plan/map_edited',
        color: {r: 0, g: 255, b: 255},  // {r:0,g:255,b:255} gridmap, {r:255,g:0,b:255} loc costmap, {r:255,g:255,b:0} glob costmap
        opacity: 0.99,
        offsetPose: z_offset_map
    });


    // Add your 3D objects or other ROS3D components here

    // function animate() {
    //   // Update your animations or interactions here
    //   orbitControls.update(); // Update orbit controls
    //   viewer.render(); // Render the scene
    //   requestAnimationFrame(animate);
    // }
    //
    // animate();
    console.log("Orthographic camera with orbit controls loaded");
    console.log(viewer);
}