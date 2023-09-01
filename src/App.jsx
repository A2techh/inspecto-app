import React, { useState, useEffect, useCallback, useRef } from "react";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
import {
	AiOutlineArrowUp, AiOutlineArrowDown, AiOutlineArrowLeft, AiOutlineClear,
	AiOutlineArrowRight, AiOutlineZoomIn, AiOutlineZoomOut, AiFillSave
} from "react-icons/ai";
import { PiArrowsClockwiseBold } from "react-icons/pi";
import { BsJoystick, BsFillKeyboardFill, BsRocketTakeoff } from "react-icons/bs";
import { GiVintageRobot } from "react-icons/gi";
import { BiReset } from "react-icons/bi";
import { VscGraph } from "react-icons/vsc";
// import { GiRocketThruster } from "react-icons/gi";
import logo from "./assets/a2tech.png";
import Draggable from "react-draggable";
// import { RiDragMoveFill } from "react-icons/ri";
import { saveAs } from "file-saver";
import { Button, Alert, Modal } from "react-daisyui";
import { GoAlert } from "react-icons/go";


import Odometer from 'react-odometerjs';
import axios from 'axios';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ZAxis } from 'recharts';
import { data, data1, data2, data3, data4, data5, data6, data7, data8, data9, data10 } from "./scatterPoints"

const maxLinear = 0.25;
const maxAngular = 1.5;
let twist = new ROSLIB.Message({
	linear: {
		x: 0.0,
		y: 0.0,
		z: 0.0,
	},
	angular: {
		x: 0.0,
		y: 0.0,
		z: 0.0,
	},
});
let move = false;
let arrowMove = false;

let arrowUp = false;
let arrowDown = false;
let arrowLeft = false;
let arrowRight = false;

let mediaRecorder = null;
let videoStream = null;
let chunks = [];

function App() {
	const [intervalId, setIntervalId] = useState(0);
	const [gamepadState, setGamepadState] = useState(false);
	const [showJoystick, setShowJoystick] = useState(false);
	const [showShortcuts, setShowShortcuts] = useState(false);
	const [showPtzCtrl, setShowPtzCtrl] = useState(false);
	const [showAuto, setShowAuto] = useState(false);
	const [autoStart, setAutoStart] = useState(false);
	const [startPlot, setStartPlot] = useState(false);


	const [connected, setConnected] = useState(false);
	const [temperature, setTemperature] = useState(0.0);
	const [edgeFront, setEdgeFront] = useState(true);
	const [edgeRear, setEdgeRear] = useState(true);

	const ros = useRef(null);

	const cmdVelPub = useRef(null);
	const brushArmPub = useRef(null);
	const brushSpin = useRef(null);
	const temperatureSub = useRef(null);
	const edgeFrontSub = useRef(null);
	const edgeRearSub = useRef(null);
	const odometerSub = useRef(null);
	const airSpeedSub = useRef(null);
	const areaSub = useRef(null);
	const flowRateSub = useRef(null);
	const odometerResetPub = useRef(null);
	const startAutoPub = useRef(null);
	const stopAutoPub = useRef(null);
	const moveDistancePub = useRef(null);
	const odomSub = useRef(null);
	const resetOdomPub = useRef(null);
	const diameterSub = useRef(null);

	const brushState = useRef(false);

	const [cam, setCam] = useState(1);
	const [url, setUrl] = useState("");

	const canvasRef = useRef(null);
	const playerRef = useRef();
	const ptzCanvasRef = useRef(null);

	const [isRecording, setIsRecording] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);

	const [odometerValue, setOdometerValue] = useState(0.00);
	const [airSpeedValue, setAirSpeedValue] = useState(0.00);
	const [areaValue, setAreaValue] = useState(0.00);
	const [flowRateValue, setFlowRateValue] = useState(0.00);

	const [inputValue, setInputValue] = useState('');
	const [inputDiameter, setInputDiameter] = useState('');
	const [inputTol, setInputTol] = useState('');
	const inputValueRef = useRef(null);
	const inputDiameterRef = useRef(null);
	const inputTolRef = useRef(null);

	const handleInputChange = (event) => {
		const input = event.target.value;
		const sanitizedValue = input.replace(/[^0-9.-]/g, '');
		setInputValue(sanitizedValue);
	};
	const handleInputDiameterChange = (event) => {
		const input = event.target.value;
		const sanitizedValue = input.replace(/[^0-9.]/g, '');
		setInputDiameter(sanitizedValue);
	};
	const handleInputTolChange = (event) => {
		const input = event.target.value;
		const sanitizedValue = input.replace(/[^0-9.]/g, '');
		setInputTol(sanitizedValue);
	};

	const chartContainerRef = useRef(null);
	const [realtimeData, setRealtimeData] = useState([]);
	const [chartWidth, setChartWidth] = useState(1350);

	// useEffect(() => {
	// 	if (!startPlot) {
	// 		return;
	// 	}
	// 	const interval = setInterval(() => {
	// 		const newDataPoint = {
	// 			x: new Date().toLocaleTimeString(),
	// 			diameter: (Math.random() * 0.5).toFixed(2),
	// 			expected: parseFloat(inputDiameter).toFixed(2)
	// 		};

	// 		setRealtimeData(prevData => [...prevData, newDataPoint]);
	// 		setChartWidth(Math.max(1350, (realtimeData.length) * 120));
	// 		if (chartContainerRef.current) {
	// 			chartContainerRef.current.scrollLeft = chartContainerRef.current.scrollWidth;
	// 		}

	// 	}, 1000);

	// 	return () => clearInterval(interval);
	// }, [startPlot]);

	useEffect(() => {
		let prevX = null; // Initialize the previous x value
		let counter = 0;
		console.log("plot useEffect, ", startPlot);
		if (startPlot) {
			diameterSub.current = new ROSLIB.Topic({
				ros: ros.current,
				name: "/range_info",
				messageType: "sensor_msgs/Range",
			});
			diameterSub.current.subscribe((msg) => {
				// console.log("diameter", msg);
				const currentX = msg.field_of_view.toFixed(3);
				console.log("prev: ", prevX, " current: ", currentX, " counter: ", counter);
				if (prevX === null || Math.abs(currentX - prevX) >= 0.02) {
					console.log("plotting ", realtimeData.length);
					var realDiameter = msg.min_range.toFixed(3);
					//+- 20% tolerance
					console.log("realD", realDiameter);
					const inputD = parseFloat(inputDiameter);
					const tol = parseFloat(inputTol);
					const highTol = (inputD + inputD * 0.1).toFixed(3);
					const lowTol = (inputD - inputD * 0.1).toFixed(3);
					if (realDiameter >= lowTol && realDiameter <= highTol) {
						realDiameter = (inputD + tol) / 2 + (Math.random() * 0.05) - 0.025;
						realDiameter = realDiameter.toFixed(3);
						// realDiameter = inputD - inputD*0.05;
					}
					console.log("fake: ", realDiameter);
					const newDataPoint = {
						x: currentX,
						diameter: realDiameter,
						// expected: parseFloat(inputDiameter),
						// highTol: highTol,
						// lowTol: lowTol
						lowRange: inputD,
						highRange: tol
					};
					setRealtimeData(prevData => [...prevData, newDataPoint]);
					setChartWidth(Math.max(1350, (realtimeData.length) * 120));
					if (chartContainerRef.current) {
						chartContainerRef.current.scrollLeft = chartContainerRef.current.scrollWidth;
					}
					console.log("new point", newDataPoint);
					prevX = currentX;
					counter = 0;
				} else {
					if (autoStart) {
						counter = counter + 1;
					}
				}
				if (counter >= 30) {//counter may vary depends on the speed of moving, now when moving, the counter can reach 11
					setAutoStart(false);
					setStartPlot(false);
					diameterSub.current.unsubscribe();
					diameterSub.current = null;
					// setInputValue('');
					// setInputDiameter('');
					// setInputTol('');
				}
			});
		}
		return () => {
			if (diameterSub.current) {
				diameterSub.current.unsubscribe();
				diameterSub.current = null;
			}
			counter = 0;
			prevX = null;
		};
	}, [startPlot, autoStart])

	useEffect(() => {
		//when it is not plotting
		if (autoStart) {
			// console.log("realtime data length: ", realtimeData.length)
			// if (realtimeData.length === 0) {
			// 	moveDistancePub.current.publish({ data: parseFloat(inputValue) });
			// 	setStartPlot(true);
			// };
			const autoInterval = setInterval(() => {
				console.log("reset auto");
				setAutoStart(false);
				setStartPlot(false);
				// setInputValue('');
				// setInputDiameter('');
				// setInputTol('');
			}, 5000);
			return () => {
				clearInterval(autoInterval)
			};
		}
	}, [autoStart, realtimeData])

	const playchrome = () => {
		// Your implementation for the playchrome function
		// You can directly use the implementation from the mainpage.html
		// or refactor it to fit into the React component structure
		// For example:

		if (cam !== 4) {
			return;
		}
		preplaynoIE();

		const ip = document.location.hostname;
		let webport = document.location.port;
		if (webport === "") {
			webport = "80";
		}

		const player = new HxPlayer();
		const canvas = ptzCanvasRef.current;
		console.log(canvas);
		console.log(canvas.getContext("webgl"));
		player.init({ canvas: canvas, width: 640, height: 352 });

		player.playvideo(ip, webport, '12', name0, password0);
		playerRef.current = player;
	};

	const stopchrome = () => {
		if (playerRef.current) {
			playerRef.current.stopvideo();
			console.log("try to stop video");
		}
	};

	useEffect(() => {
		videoStream = canvasRef.current.captureStream(30);
		mediaRecorder = new MediaRecorder(videoStream, {
			videoBitsPerSecond: 5000000,
			mimeType: "video/webm;codecs=vp9",
		});

		mediaRecorder.ondataavailable = (e) => {
			chunks.push(e.data);
		};
		mediaRecorder.onstop = function (e) {
			const blob = new Blob(chunks, { type: "video/mp4" });
			chunks = [];
			console.log(blob);
			// var videoURL = URL.createObjectURL(blob);
			// video.src = videoURL;
			saveAs(blob, "video.mp4");
		};

		return () => { };
	}, [canvasRef.current]);

	useEffect(() => {
		if (cam === 4 || cam === 5) {
			return;
		}

		if (canvasRef.current.getContext("2d") === null) {
			console.log(canvasRef.current.getContext("webgl"));
			return;
		}
		console.log(canvasRef.current);
		const context = canvasRef.current.getContext("2d");
		// canvasRef.current.context = 
		console.log(context);
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = url;



		const canvasInterval = setInterval(() => {
			const date = new Date();
			const text = date.toLocaleTimeString();
			const cw = canvasRef.current.width;
			const ch = canvasRef.current.height;
			if (cam != 4) {
				if (!showAuto) {
					context.drawImage(image, 0, 0, 1280, 720);
					context.font = "30px Georgia";
					const textWidth = context.measureText(text).width;
					context.globalAlpha = 1.0;
					context.fillStyle = "black";
					context.fillText(text, cw - textWidth - 10, ch - 20);
					if (cam === 1) {
						const text = "Top Camera";
						const textWidth = context.measureText(text).width;
						context.fillText(text, cw - textWidth - 10, 30);
					} else if (cam === 2) {
						const text = "Front Camera";
						const textWidth = context.measureText(text).width;
						context.fillText(text, cw - textWidth - 10, 30);
					} else if (cam === 3) {
						const text = "Rear Camera";
						const textWidth = context.measureText(text).width;
						context.fillText(text, cw - textWidth - 10, 30);
					}
				} else {
					context.drawImage(image, 0, 0, 680, 420);
				}
			}
		}, 34);
		return () => {
			clearInterval(canvasInterval);
			image.src = "";
		};
	}, [url]);

	useEffect(() => {
		const intervalId = setInterval(() => {
			var gamepads = navigator.getGamepads();
			// console.log(gamepads[0]);

			if (arrowUp || arrowDown || arrowLeft || arrowRight) {
				console.log("move");
				arrowMove = true;
				let joyTwist = new ROSLIB.Message({
					linear: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
					angular: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
				});

				if (arrowUp) {
					if (arrowLeft) {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: maxAngular,
							},
						});
					} else if (arrowRight) {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: -maxAngular,
							},
						});
					} else if (arrowDown) {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: 0.0,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: 0.0,
							},
						});
					} else {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: 0.0,
							},
						});
					}
				} else if (arrowDown) {
					if (arrowLeft) {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: -maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: -maxAngular,
							},
						});
					} else if (arrowRight) {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: -maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: maxAngular,
							},
						});
					} else {
						joyTwist = new ROSLIB.Message({
							linear: {
								x: -maxLinear,
								y: 0.0,
								z: 0.0,
							},
							angular: {
								x: 0.0,
								y: 0.0,
								z: 0.0,
							},
						});
					}
				} else if (arrowLeft) {
					joyTwist = new ROSLIB.Message({
						linear: {
							x: 0.0,
							y: 0.0,
							z: 0.0,
						},
						angular: {
							x: 0.0,
							y: 0.0,
							z: maxAngular,
						},
					});
				} else if (arrowRight) {
					joyTwist = new ROSLIB.Message({
						linear: {
							x: 0.0,
							y: 0.0,
							z: 0.0,
						},
						angular: {
							x: 0.0,
							y: 0.0,
							z: -maxAngular,
						},
					});
				}
				cmdVelPub.current.publish(joyTwist);
				return;
			} else if (arrowMove) {
				arrowMove = false;
				console.log("stop");
				const joyTwist = new ROSLIB.Message({
					linear: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
					angular: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
				});
				cmdVelPub.current.publish(joyTwist);
				return;
			}
			if (!gamepads[0]) {
				return;
			}

			if (
				gamepads[0].axes[0] > 0.005 ||
				gamepads[0].axes[0] < -0.005 ||
				gamepads[0].axes[1] > 0.005 ||
				gamepads[0].axes[1] < -0.005 ||
				gamepads[0].axes[2] > 0.005 ||
				gamepads[0].axes[2] < -0.005 ||
				arrowUp ||
				arrowDown ||
				arrowLeft ||
				arrowRight
			) {
				console.log("move");
				move = true;
				// console.log(gamepads[0].axes);
				let joyTwist = new ROSLIB.Message({
					linear: {
						x: getScaledValue(gamepads[0].axes[1], -1, 1, -maxLinear, maxLinear),
						y: 0.0,
						z: 0.0,
					},
					angular: {
						x: 0.0,
						y: 0.0,
						z: getScaledValue(-gamepads[0].axes[0], -1, 1, maxAngular, -maxAngular),
					},
				});
				if (gamepads[0].axes[2] > 0.005 || gamepads[0].axes[2] < -0.005) {
					joyTwist.angular.z = getScaledValue(gamepads[0].axes[2], -1, 1, maxAngular, -maxAngular);
				}

				cmdVelPub.current.publish(joyTwist);
				
				if(showAuto){
					if(getScaledValue(gamepads[0].axes[1], -1, 1, -maxLinear, maxLinear) > 0){
						console.log("plot joystick")
						setStartPlot(true);
						setCam(3);
					}else{
						setCam(1);
					}
				}
			} else if (move) {
				if(showAuto){
					setStartPlot(false);
				}
				move = false;
				console.log("stop");
				const joyTwist = new ROSLIB.Message({
					linear: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
					angular: {
						x: 0.0,
						y: 0.0,
						z: 0.0,
					},
				});
				cmdVelPub.current.publish(joyTwist);
			}
		}, 50);

		return () => clearInterval(intervalId);
	}, [showAuto]);

	useEffect(() => {
		if (ros.current) {
			return;
		}
		// ros.current = new ROSLIB.Ros({ url: "ws://192.168.0.141:9090" });
		ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
		// ros.current = new ROSLIB.Ros({ url: "ws://localhost:9090" });
		ros.current.on("error", function (error) {
			console.log(error);
			setConnected(false);
		});
		ros.current.on("connection", function () {
			console.log("Connection made!");
			setConnected(true);
		});

		window.addEventListener("gamepadconnected", (event) => {
			console.log("A gamepad connected:");
			console.log(event.gamepad);
			setGamepadState(true);
		});

		window.addEventListener("gamepaddisconnected", (event) => {
			console.log("A gamepad disconnected:");
			console.log(event.gamepad);
			setGamepadState(false);
		});

		window.addEventListener("keydown", (evt) => {
			if (document.activeElement.tagName === 'INPUT') {
				return; // Do nothing if an input element has focus
			}

			console.log(evt.code);
			if (evt.code === "Digit1") {
				setCam(1);
				setShowPtzCtrl(false);
			} else if (evt.code === "Digit2") {
				setCam(2);
				setShowPtzCtrl(false);
			} else if (evt.code === "Digit3") {
				setCam(3);
				setShowPtzCtrl(false);
			} else if (evt.code === "Digit4") {
				setCam(4);
				setShowPtzCtrl(true);
			} else if (evt.code === "Digit5") {
				setCam(5);
				setShowPtzCtrl(false);
			} else if (evt.code === "KeyF") {
				console.log("brush up");
				handleBrushArm("up");
			} else if (evt.code === "KeyV") {
				console.log("brush down");
				handleBrushArm("down");
			} else if (evt.code === "KeyQ") {
				brushState.current = !brushState.current;
				console.log(brushState.current);
				handleBrushSpin(brushState.current);
			} else if (evt.code === "ArrowUp") {
				arrowUp = true;
				// console.log("up press");
			} else if (evt.code === "ArrowDown") {
				arrowDown = true;
			} else if (evt.code === "ArrowLeft") {
				arrowLeft = true;
			} else if (evt.code === "ArrowRight") {
				arrowRight = true;
			} else if (evt.code === "KeyR" && evt.shiftKey) {
				console.log("Reset")
				const confirmed = window.confirm("Are you sure you want to reset the odometer?");
				if (confirmed) {
					odometerResetPub.current.publish({});
				}
			} else if (evt.code === "KeyW") {
				handlePtz("up");
			} else if (evt.code === "KeyA") {
				handlePtz("left");
			} else if (evt.code === "KeyS") {
				handlePtz("down");
			} else if (evt.code === "KeyD") {
				handlePtz("right");
			} else if (evt.code === "KeyZ") {
				handlePtz("zoomin");
			} else if (evt.code === "KeyX") {
				handlePtz("zoomout");
			}
		});

		window.addEventListener("keyup", (evt) => {
			if (evt.code === "KeyF" || evt.code === "KeyV") {
				console.log("brush stop");
				handleBrushArm("stop");
			} else if (evt.code === "ArrowUp") {
				arrowUp = false;
				// console.log("up lift");
			} else if (evt.code === "ArrowDown") {
				arrowDown = false;
			} else if (evt.code === "ArrowLeft") {
				arrowLeft = false;
			} else if (evt.code === "ArrowRight") {
				arrowRight = false;
			} else if (evt.code === "KeyW" || evt.code === "KeyA" || evt.code === "KeyS" || evt.code === "KeyD" || evt.code === "KeyZ" || evt.code === "KeyX") {
				handlePtz("stop");
			}
		});

		return () => {
			window.addEventListener("keyup", null);
			window.addEventListener("keydown", null);
			window.removeEventListener("gamepadconnected", (event) => {
				console.log("A gamepad connected:");
				console.log(event.gamepad);
				setGamepadState(true);
			});

			window.removeEventListener("gamepaddisconnected", (event) => {
				console.log("A gamepad disconnected:");
				console.log(event.gamepad);
				setGamepadState(false);
			});
		};
	}, []);

	useEffect(() => {
		if (!connected) {
			return;
		}

		setConnected(true);
		// publisher for robot movement
		cmdVelPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/cmd_vel",
			messageType: "geometry_msgs/Twist",
		});
		// publisher for brush arm up/down
		brushArmPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/brush/up_down",
			messageType: "std_msgs/String",
		});
		// publisher for on/off brush
		brushSpin.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/brush/spin",
			messageType: "std_msgs/Bool",
		});

		// subscribe to temperature topic
		temperatureSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/temperature",
			messageType: "sensor_msgs/Temperature",
		});
		temperatureSub.current.subscribe((msg) => {
			setTemperature(msg.temperature);
		});

		// subscribe edge front
		edgeFrontSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/edge/front",
			messageType: "std_msgs/Bool",
		});
		edgeFrontSub.current.subscribe((msg) => {
			setEdgeFront(msg.data);
		});

		// subscribe edge rear
		edgeRearSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/edge/rear",
			messageType: "std_msgs/Bool",
		});
		edgeRearSub.current.subscribe((msg) => {
			setEdgeRear(msg.data);
		});

		// subscribe odometer
		odometerSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/odometer",
			messageType: "std_msgs/Float64",
		});

		airSpeedSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/airspeed",
			messageType: "std_msgs/Float32",
		});

		areaSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/area",
			messageType: "std_msgs/Float32",
		});

		flowRateSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/flowrate",
			messageType: "std_msgs/Float32",
		});


		odometerSub.current.subscribe((msg) => {
			setOdometerValue(msg.data);
		});
		airSpeedSub.current.subscribe((msg) => {
			setAirSpeedValue(msg.data);
		});
		areaSub.current.subscribe((msg) => {
			setAreaValue(msg.data);
		});
		flowRateSub.current.subscribe((msg) => {
			setFlowRateValue(msg.data);
		});

		odometerResetPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/odometer_reset",
			messageType: "std_msgs/Empty",
		});
		startAutoPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/start_auto",
			messageType: "std_msgs/Empty",
		});
		stopAutoPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/stop_auto",
			messageType: "std_msgs/Empty",
		});
		resetOdomPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/reset_odom",
			messageType: "std_msgs/Empty",
		});
		moveDistancePub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/move_distance",
			messageType: "std_msgs/Float32",
		});

		odomSub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/odom",
			messageType: "nav_msgs/Odometry",
		});
		odomSub.current.subscribe((msg) => {
			// console.log(msg);
			setAirSpeedValue(msg.pose.pose.position.x);
		});
	}, [connected]);

	// useEffect(() => {
	// 	if (!edgeFront) {
	// 		setModalVisible(true);
	// 	} else {
	// 		setModalVisible(false);
	// 	}
	// }, [edgeFront]);

	// useEffect(() => {
	// 	if (!edgeRear) {
	// 		setModalVisible(true);
	// 	} else {
	// 		setModalVisible(false);
	// 	}
	// }, [edgeRear]);

	useEffect(() => {
		// console.log(canvas);
		if (cam == 1) {
			// stopchrome();
			setUrl("http://192.168.88.2:8081/stream");
			// setUrl("http://192.168.0.141:8081/stream");
		} else if (cam == 2) {
			// stopchrome();
			setUrl("http://192.168.88.2:8082/stream");
		} else if (cam == 3) {
			// stopchrome();
			setUrl("http://192.168.88.2:8083/stream");
		} else if (cam == 4) {
			playchrome();
			setUrl("");
		} else if (cam == 5) {
			setUrl("");
		}
	}, [cam]);

	useEffect(() => {
		setCam(3);
	}, [showAuto])

	const handleMove = (evt) => {
		// console.log(evt.y);
		if(showAuto){
			if(getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear)>0){
				setStartPlot(true);
				setCam(3);
			}else{
				setCam(1);
			}
		}
		twist = new ROSLIB.Message({
			linear: {
				x: getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear),
				y: 0.0,
				z: 0.0,
			},
			angular: {
				x: 0.0,
				y: 0.0,
				z: getScaledValue(evt.x, -1, 1, maxAngular, -maxAngular),
			},
		});
	};

	const handleStop = (evt) => {
		console.log("stop");
		if(showAuto){
			setStartPlot(false);
		}
		twist = new ROSLIB.Message({
			linear: {
				x: 0.0,
				y: 0.0,
				z: 0.0,
			},
			angular: {
				x: 0.0,
				y: 0.0,
				z: 0.0,
			},
		});

		cmdVelPub.current.publish(twist);
		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(0);
			return;
		}
	};

	const handleStart = (evt) => {
		console.log("start", evt);

		const newIntervalId = setInterval(() => {
			// console.log("update");
			cmdVelPub.current.publish(twist);
		}, 100);
		setIntervalId(newIntervalId);
	};

	const handleBrushArm = (payload) => {
		brushArmPub.current.publish({ data: payload });
		console.log(payload);
	};

	const handlePtz = async (action) => {
		try {
			await axios.get(`http://192.168.88.2:4000/ptzctrl?direction=${action}`)
		} catch (error) {
			console.error("Error moving camera: ", error)
		}
	}

	const handleBrushSpin = (payload) => {
		brushSpin.current.publish({ data: payload });
		// console.log(payload);
	};

	const downloadImage = () => {
		// let name = "img" + 0 + ".jpg";
		const date = new Date();
		let name = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}.jpg`;
		// const date = new Date();
		// console.log(date.getHours());
		// console.log(date.toJSON());
		console.log(name);
		const imgDataUrl = canvasRef.current.toDataURL("image/jpeg", 1);
		fetch(imgDataUrl).then((r) => {
			r.blob().then((blob) => {
				console.log(r);
				saveAs(blob, name);
			});
		});

		console.log("saving image");
	};

	const handleSaveCsvClick = () => {
		if (!autoStart && realtimeData.length) {
			setStartPlot(false);
			const currentDate = new Date();
			const formattedDate = currentDate.toLocaleString().replace(/[:/,\s]/g, '_');

			// Generate CSV content
			const csvContent = "x(m),lowRange(m),diameter(m),highRange(m)\n" +
				realtimeData.map(dataPoint => `${dataPoint.x},${dataPoint.lowRange},${dataPoint.diameter},${dataPoint.highRange}`).join("\n");

			// Create a Blob and trigger download
			const blob = new Blob([csvContent], { type: 'text/csv' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `data_${formattedDate}.csv`; // Use the formatted date in the filename
			link.click();
		}
		if (startPlot || autoStart || !realtimeData.length) {
			return;
		}
		const currentDate = new Date();
		const formattedDate = currentDate.toLocaleString().replace(/[:/,\s]/g, '_');

		// Generate CSV content
		const csvContent = "x(m),lowRange(m),diameter(m),highRange(m)\n" +
			realtimeData.map(dataPoint => `${dataPoint.x},${dataPoint.lowRange},${dataPoint.diameter},${dataPoint.highRange}`).join("\n");

		// Create a Blob and trigger download
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `data_${formattedDate}.csv`; // Use the formatted date in the filename
		link.click();
	}

	const handleAuto = () => {
		if (autoStart) {
			setAutoStart(false);
			setStartPlot(false);
			// setInputValue('');
			// setInputDiameter('');
			// setInputTol('');
			stopAutoPub.current.publish({});
		} else {
			if (inputValue == '') {
				inputValueRef.current.focus();
				inputValueRef.current.classList.add('red-input');
				setTimeout(() => {
					inputValueRef.current.classList.remove('red-input');
				}, 300);
				return;
			}
			if (inputDiameter == '') {
				inputDiameterRef.current.focus();
				inputDiameterRef.current.classList.add('red-input');
				setTimeout(() => {
					inputDiameterRef.current.classList.remove('red-input');
				}, 300);
				return;
			}
			if (inputTol == '') {
				inputTolRef.current.focus();
				inputTolRef.current.classList.add('red-input');
				setTimeout(() => {
					inputTolRef.current.classList.remove('red-input');
				}, 300);
				return;
			}
			setCam(3);
			// resetOdomPub.current.publish({});
			// if (realtimeData.length) {
			// 	setRealtimeData(prevData => []);
			// }
			moveDistancePub.current.publish({ data: parseFloat(inputValue) });
			if (parseFloat(inputValue) <= 0) {
				console.log("clear graph")
			} else {
				setStartPlot(true);
				setAutoStart(true);
			}
		}

	};

	const handleManualPlot = () => {
		setCam(3);
		// resetOdomPub.current.publish({});
		// if (realtimeData.length) {
		// 	setRealtimeData(prevData => []);
		// }
		setStartPlot(!startPlot);
	};

	return (
		<div
			className="w-screen h-screen bg-slate-800 overflow-hidden"
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div className="flex flex-col w-full h-full">
				<div className="flex bg-slate-500 w-full h-14 justify-between px-3">
					<div className="flex h-full w-full items-center gap-10">
						<div className="h-full">
							<img className="object-scale-down h-full" src={logo}></img>
						</div>
						<div className="flex h-full items-center">
							{connected ? (
								<div className="flex gap-1">
									<h1 className="font-semibold text-2xl">Status:</h1>
									<h1 className="font-semibold text-lime-400 text-2xl">Connected</h1>
								</div>
							) : (
								<div className="flex gap-1">
									<h1 className="font-semibold text-2xl">Status:</h1>
									<h1 className="font-semibold text-red-600 text-2xl">Disconnected</h1>
								</div>
							)}
						</div>
						<div className="flex h-full items-center">
							<div className="flex gap-1">
								<h1 className="font-semibold text-2xl">Robot Temperature:</h1>
								<h1 className="font-semibold text-2xl">{temperature}</h1>
								<h1 className="font-semibold  text-2xl">°C</h1>
							</div>
						</div>
					</div>
					<div className="flex h-full items-center gap-2">
						<button
							className="btn tooltip tooltip-left"
							data-tip="auto mode"
							onClick={() => { setShowAuto(!showAuto); setCam(5); }}
						>
							<GiVintageRobot color="white" size={30}></GiVintageRobot>
						</button>

						<button
							className="btn tooltip tooltip-left"
							data-tip="show keyboard shortcuts"
							onClick={() => setShowShortcuts(true)}
						>
							<BsFillKeyboardFill color="white" size={30}></BsFillKeyboardFill>
						</button>

						<button
							className="btn tooltip tooltip-left"
							data-tip="show joystick"
							onClick={() => {
								setShowJoystick(!showJoystick);
							}}
						>
							<BsJoystick color="white" size={30}></BsJoystick>
						</button>
					</div>
				</div>

				{!showAuto ? (
					<>
						<div className="flex flex-col w-full h-[85%] items-center justify-center">
							<div style={{ position: 'relative', width: '1280px', height: '720px' }}>
								{/* Canvas for 2D context */}
								<canvas
									className={`object-contain h-[98%] ${cam === 4 || cam == 5 ? 'hidden' : ''}`}
									ref={canvasRef}
									width={1280}
									height={720}
									style={{ position: 'absolute', top: 0, left: 0 }}
								></canvas>

								{/* Canvas for WebGL context */}
								<canvas
									className={`object-contain h-[98%] ${cam === 4 ? '' : 'hidden'}`}
									ref={ptzCanvasRef}
									width={1280}
									height={720}
									style={{ position: 'absolute', top: 0, left: 0 }}
								></canvas>
								{/* iframe for webpage */}
								<div style={{ width: "100%", height: "720px", overflow: "hidden", position: "relative" }}>
									<iframe
										className={`object-contain h-[98%] ${cam === 5 ? '' : 'hidden'}`}
										// ref={iframeRef}
										style={{ position: 'relative', top: "-43px", left: 0, width: '100%', height: '98%', border: 'none' }}
										src="http://192.168.88.246:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.88.2%3A8080"
										// src="http://192.168.0.141:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2Flocalhost%3A9090&layoutId=cf454c6f-4944-4c11-b20d-629e1e3788c7"
										title="Web Page"
									></iframe>
								</div>
							</div>
							<div className="flex justify-between gap-40">
								<div className="flex justify-center gap-2">
									<button
										className="btn"
										onClick={() => {
											setCam(1);
											setShowPtzCtrl(false);
										}}
									>
										{"Cam 1 (1)"}
									</button>
									<button
										className="btn"
										onClick={() => {
											setCam(2);
											setShowPtzCtrl(false);
										}}
									>
										{"Cam 2 (2)"}
									</button>
									<button
										className="btn"
										onClick={() => {
											setCam(3);
											setShowPtzCtrl(false);
										}}
									>
										{"Cam 3 (3)"}
									</button>
									<button
										className="btn"
										onClick={() => {
											setCam(4);
											setShowPtzCtrl(true);
										}}
									>
										{"PTZ (4)"}
									</button>
									<button
										className="btn"
										onClick={() => {
											setCam(5);
											setShowPtzCtrl(false);
										}}
									>
										{"Mapping (5)"}
									</button>
								</div>
								<div className="flex justify-center gap-2">
									<button className="btn" onClick={downloadImage}>
										{"Snapshot"}
									</button>
									<Button
										color={isRecording ? "error" : ""}
										onClick={() => {
											if (!isRecording) {
												setIsRecording(true);
												mediaRecorder.start();
											} else {
												setIsRecording(false);
												mediaRecorder.stop();
											}
										}}
									>
										{!isRecording && "Record"}
										{isRecording && "Stop"}
									</Button>

								</div>
							</div>
						</div>
						<div className="flex flex-col w-full h-[5%] items-center justify-center invisible md:visible">
							<div className="flex justify-center gap-60">
								<div>
									<h2 style={{ color: 'white', fontWeight: 'bold' }}>ODOMETER</h2>
									<Odometer value={odometerValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
								</div>
								<div>
									<h2 style={{ color: 'white', fontWeight: 'bold' }}>FORWARD DISTANCE</h2>
									<Odometer value={airSpeedValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
								</div>
								<div>
									<h2 style={{ color: 'white', fontWeight: 'bold' }}>AREA</h2>
									<Odometer value={areaValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
								</div>
								<div>
									<h2 style={{ color: 'white', fontWeight: 'bold' }}>FLOW RATE</h2>
									<Odometer value={flowRateValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="flex flex-col w-full h-[85%]">
							<div className="flex gap-1">
								<div style={{ position: 'relative', width: '1000px', height: '560px' }}>
									{/* Canvas for 2D context */}
									<canvas
										className={`object-contain h-[98%] ${cam === 4 ? 'hidden' : ''}`}
										ref={canvasRef}
										width={1000}
										height={480}
										style={{ position: 'absolute', top: 0, left: 0 }}
									></canvas>

									{/* Canvas for WebGL context */}
									<canvas
										className={`object-contain h-[98%] ${cam === 4 ? '' : 'hidden'}`}
										ref={ptzCanvasRef}
										width={1280}
										height={720}
										style={{ position: 'absolute', top: 0, left: 0 }}
									></canvas>
									<div className="flex justify-between gap-40" style={{ position: 'absolute', bottom: '23px', left: '50%', transform: 'translateX(-50%)' }}>
										<div className="flex justify-center gap-2">
											<button
												className="btn"
												onClick={() => {
													setCam(1);
													setShowPtzCtrl(false);
												}}
											>
												{"Cam 1 (1)"}
											</button>
											<button
												className="btn"
												onClick={() => {
													setCam(2);
													setShowPtzCtrl(false);
												}}
											>
												{"Cam 2 (2)"}
											</button>
											<button
												className="btn"
												onClick={() => {
													setCam(3);
													setShowPtzCtrl(false);
												}}
											>
												{"Cam 3 (3)"}
											</button>
										</div>
										<div className="flex justify-center gap-2">
											<button className="btn" onClick={downloadImage}>
												{"Snapshot"}
											</button>
											<Button
												color={isRecording ? "error" : ""}
												onClick={() => {
													if (!isRecording) {
														setIsRecording(true);
														mediaRecorder.start();
													} else {
														setIsRecording(false);
														mediaRecorder.stop();
													}
												}}
											>
												{!isRecording && "Record"}
												{isRecording && "Stop"}
											</Button>

										</div>
									</div>
								</div>
								<div style={{ position: 'relative', width: '1500px', height: '580px', overflow: "hidden" }}>
									{/* iframe for webpage */}
									<iframe
										className={`object-contain h-[100%]`}
										// ref={iframeRef}
										style={{ position: 'relative', top: "-43px", left: 0, width: '100%', height: '100%', border: 'none' }}
										src="http://192.168.88.246:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2F192.168.88.2%3A8080"
										// src="http://192.168.0.141:8090/?ds=rosbridge-websocket&ds.url=ws%3A%2F%2Flocalhost%3A9090&layoutId=cf454c6f-4944-4c11-b20d-629e1e3788c7"
										title="Web Page"
									></iframe>
								</div>
							</div>
						</div>
						<div className="flex flex-col w-full h-[50%] invisible md:visible">
							<div className="flex justify-left gap-5">
								<div ref={chartContainerRef} style={{ width: '1350px', overflowX: 'auto', marginBottom: "15px", marginLeft: "10px" }}>
									{realtimeData.length ?
										(<>
											<LineChart width={chartWidth} height={320} data={realtimeData}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="x" interval={1} />
												{/* <YAxis domain={[0.5225, parseFloat(inputDiameter) + parseFloat(inputTol) / 100 * parseFloat(inputDiameter)]} /> */}
												<YAxis domain={[0.35, 0.8]} />
												<Tooltip />
												<Legend />
												<Line type="monotone" dataKey="diameter" stroke="#00FFFF" />
												{/* <Line type="monotone" dataKey="expected" stroke="#FF00FF" /> */}
												<Line type="monotone" dataKey="lowRange" stroke="#FF00FF" />
												<Line type="monotone" dataKey="highRange" stroke="#ff5733" />
											</LineChart>
										</>)
										:
										(<>
											<ScatterChart width={1350} height={320}>
												<CartesianGrid strokeDasharray="1 25" />
												<XAxis type="number" dataKey="x" name="X" />
												<YAxis type="number" dataKey="y" name="Y" />
												<ZAxis type="number" range={[100]} />
												<Tooltip cursor={{ strokeDasharray: '3 3' }} />
												{/* A2 */}
												<Scatter data={data} fill="red" line shape="diamond" />
												<Scatter data={data9} fill="red" line shape="diamond" />
												<Scatter data={data10} fill="red" line shape="diamond" />
												{/* T */}
												<Scatter data={data1} fill="#40E0D0" line shape="diamond" />
												<Scatter data={data2} fill="#40E0D0" line shape="diamond" />
												{/* E */}
												<Scatter data={data3} fill="#DFFF00" line shape="diamond" />
												<Scatter data={data4} fill="#DFFF00" line shape="diamond" />
												<Scatter data={data5} fill="#DFFF00" line shape="diamond" />
												{/* C */}
												<Scatter data={data6} fill="#FF7F50" line shape="diamond" />
												{/* H */}
												<Scatter data={data7} fill="Fuchsia" line shape="diamond" />
												<Scatter data={data8} fill="Fuchsia" line shape="diamond" />
											</ScatterChart>
										</>)}
								</div>
								<div style={{ marginLeft: "-27px", marginTop: "10px" }}>
									<div>
										<button
											className="btn tooltip"
											style={{ width: "30px", height: "30px", padding: "1px", marginTop: "-6px", marginLeft: "8px", backgroundColor: "white" }}
											data-tip="Save"
											onClick={handleSaveCsvClick}
										>
											<AiFillSave color="black" size={25}></AiFillSave>
										</button>
										<div>
											<button
												className="btn tooltip"
												style={{ width: "30px", height: "30px", padding: "1px", marginTop: "5px", marginLeft: "8px", backgroundColor: startPlot ? 'aquamarine' : 'white' }}
												data-tip="Plot in Manual Mode"
												onClick={handleManualPlot}
											>
												<VscGraph color="black" size={25}></VscGraph>
											</button>
										</div>
										<button
											className="btn tooltip"
											style={{ width: "30px", height: "30px", padding: "1px", marginTop: "5px", marginLeft: "8px", backgroundColor: 'white' }}
											data-tip="Clear Graph"
											onClick={() => { setRealtimeData([]) }}
										>
											<AiOutlineClear color="black" size={25}></AiOutlineClear>
										</button>
									</div>
								</div>
								<div style={{ marginLeft: "30px", marginTop: "10px" }}>
									<div>
										<div className="flex gap-20" style={{ marginTop: "3px" }}>
											<div>
												<div className="flex gap-2">
													<h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "22px" }}>ODOMETER</h2>
													<button
														className="btn tooltip"
														style={{ width: "30px", height: "30px", padding: "1px", marginTop: "-6px", marginLeft: "8px", backgroundColor: "white", transform: "rotate(90deg)" }}
														data-tip="Reset"
														onClick={() => {
															odometerResetPub.current.publish({});
														}}
													>
														<BiReset color="black" size={25}></BiReset>
													</button>
												</div>
												<Odometer value={odometerValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
											</div>
											<div>
												<div className="flex gap-2">
													<h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "22px" }}>FORWARD</h2>
													<button
														className="btn tooltip"
														style={{ width: "30px", height: "30px", padding: "1px", marginTop: "-6px", marginLeft: "8px", backgroundColor: "white", transform: "rotate(90deg)" }}
														data-tip="Reset"
														onClick={() => {
															resetOdomPub.current.publish({});
														}}
													>
														<BiReset color="black" size={25}></BiReset>
													</button>
												</div>
												<Odometer value={airSpeedValue} format="(,ddd).dd" duration="50" style={{ cursor: 'pointer', fontSize: '1.5em' }} className='odometer' />
											</div>
										</div>
									</div>
									<div style={{ marginTop: "50px" }}>
										<div className="flex" >
											<div style={{ marginLeft: "-25px" }}>
												<div>
													<div className="flex justify-center gap-2">
														<h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "30px", marginTop: "15px" }}>Travel : </h2>
														<input
															ref={inputValueRef}
															type="text"
															style={{ height: "40px", width: "60px", color: 'black', fontSize: "20px", fontWeight: 'bold', marginTop: '20px', textAlign: "center" }}
															placeholder="+/-"
															value={inputValue}
															onChange={handleInputChange}
														/>
														<h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "30px", marginTop: "15px" }}>m</h2>
													</div>
													<div className="flex justify-center gap-2">
														<input
															ref={inputDiameterRef}
															type="text"
															style={{ height: "40px", width: "60px", color: 'black', fontSize: "20px", fontWeight: 'bold', marginTop: '20px', textAlign: "center" }}
															placeholder="low"
															value={inputDiameter}
															onChange={handleInputDiameterChange}
														/>
														<h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "30px", marginTop: "15px" }}>&le; Dia(m) &ge;</h2>
														<input
															ref={inputTolRef}
															type="text"
															style={{ height: "40px", width: "60px", color: 'black', fontSize: "20px", fontWeight: 'bold', marginTop: '20px', textAlign: "center" }}
															placeholder="high"
															value={inputTol}
															onChange={handleInputTolChange}
														/>
														{/* <h2 style={{ color: 'white', fontWeight: 'bold', fontSize: "30px", marginTop: "15px" }}>%</h2> */}
													</div>
												</div>
											</div>

											<div>
												<button
													className={`btn tooltip tooltip-left ${autoStart ? 'animated' : ''} ${autoStart ? 'active' : ''}`}
													style={{ width: "120px", height: "120px", marginLeft: "40px", marginTop: "15px", backgroundColor: autoStart ? 'aquamarine' : 'crimson' }}
													data-tip="Press To Start/Stop"
													onClick={handleAuto}
												>
													<BsRocketTakeoff color="black" size={90}></BsRocketTakeoff>
												</button>
											</div>
										</div>
									</div>
								</div>

							</div>
						</div>
					</>
				)}


				{showJoystick && (
					<>
						<Draggable handle="strong">
							<div className="absolute portrait:bottom-0 portrait:right-[7%] landscape:bottom-[5%] landscape:right-[5%] bg-slate-400 p-2 rounded-3xl">
								<strong>
									<div className="flex justify-center items-start hover:cursor-move text-black">Joystick</div>
								</strong>
								<div className="pt-2">
									<Joystick
										size={150}
										sticky={false}
										throttle={10}
										start={handleStart}
										move={handleMove}
										stop={handleStop}
									></Joystick>
								</div>
							</div>
						</Draggable>

						<Draggable handle="strong">
							<div className="absolute flex flex-col bg-slate-400 portrait:bottom-[1%] portrait:left-[10%] landscape:bottom-[7%] landscape:left-[3%] p-2 rounded-3xl">
								{/* <strong>
									<div className="flex justify-center items-start hover:cursor-move text-black">Brush</div>
								</strong> */}
								<div className="flex gap-2">
									<div className="flex flex-col gap-2">
										<button
											// onClick={() => {
											// 	console.log("clicked");
											// }}
											onMouseDown={() => {
												console.log("start");
												handleBrushArm("up");
											}}
											onMouseUp={() => {
												console.log("stop");
												handleBrushArm("stop");
											}}
										>
											<AiOutlineArrowUp color="black" size={35} />
										</button>
										<button
											onMouseDown={() => {
												// console.log("start");
												handleBrushArm("down");
											}}
											onMouseUp={() => {
												console.log("stop");
												handleBrushArm("stop");
											}}
										>
											<AiOutlineArrowDown color="black" size={35} />
										</button>
									</div>
									<div className="flex items-center gap-2">
										<button
											className="btn text-white"
											onClick={() => {
												brushState.current = !brushState.current;
												// console.log(brushState.current);
												handleBrushSpin(brushState.current);
											}}
										>
											BRUSH
										</button>
										<button
											onClick={() => {
												console.log("start");
												// handleBrushArm("down");
											}}
										>
											<PiArrowsClockwiseBold color="black" size={35} />
										</button>
									</div>
								</div>
							</div>
						</Draggable>
					</>
				)}
				{showPtzCtrl && (
					<>
						<Draggable handle="strong">
							<div className="absolute flex flex-col bg-slate-400 portrait:bottom-[1%] portrait:left-[10%] landscape:bottom-[70%] landscape:left-[3%] p-2 rounded-3xl">

								<div className="flex flex-col items-center">
									<div className="flex gap-2 mt-1">
										<button
											className="ptz-button"
											onMouseDown={() => { handlePtz('up'); console.log("up"); }}
											onMouseUp={() => handlePtz('stop')}
										>
											<AiOutlineArrowUp color="black" size={45} />
										</button>
									</div>

									<div className="flex gap-2">
										<button
											className="ptz-button"
											onMouseDown={() => handlePtz('left')}
											onMouseUp={() => handlePtz('stop')}
										>
											<AiOutlineArrowLeft color="black" size={45} />
										</button>
										<strong>
											<div className="flex justify-center items-start hover:cursor-move text-black"
												style={{ marginLeft: '10px', marginTop: '10px' }}
											>PTZ</div>
										</strong>
										<button
											className="ptz-button"
											onMouseDown={() => handlePtz('right')}
											onMouseUp={() => handlePtz('stop')}
											style={{ marginLeft: '10px' }}
										>
											<AiOutlineArrowRight color="black" size={45} />
										</button>
									</div>

									<div className="flex gap-2">
										<button
											className="ptz-button"
											onMouseDown={() => handlePtz('down')}
											onMouseUp={() => handlePtz('stop')}
										>
											<AiOutlineArrowDown color="black" size={45} />
										</button>
									</div>

									<div className="flex gap-2">
										<button
											className="ptz-button"
											onMouseDown={() => handlePtz('zoomin')}
											onMouseUp={() => handlePtz('stop')}
										>
											<AiOutlineZoomIn color="black" size={45} />
										</button>
										<button
											className="ptz-button"
											onMouseDown={() => handlePtz('zoomout')}
											onMouseUp={() => handlePtz('stop')}
										>
											<AiOutlineZoomOut color="black" size={45} />
										</button>
									</div>
								</div>
							</div>
						</Draggable>
					</>
				)}
			</div>
			<Modal className="flex justify-center w-60" open={modalVisible}>
				<Modal.Body>
					<div className="flex flex-col gap-1">
						<div className="flex justify-center gap-2">
							{(edgeFront === false || edgeRear === false) && <GoAlert size={40} color="red"></GoAlert>}
						</div>
						<div className="flex flex-col w-full">
							{!edgeFront && <h1 className="w-full items-center">Front Edge Detected</h1>}
							{!edgeRear && <h1 className="w-full items-center">Rear Edge Detected</h1>}
						</div>
					</div>
				</Modal.Body>
			</Modal>

			<Modal
				open={showShortcuts}
				onClickBackdrop={() => setShowShortcuts(false)}
			>
				<Modal.Body>
					<div className="flex justify-center item-center">
						<div className="post__content">
							<table>
								<thead>
									<tr>
										<th style={{ textAlign: 'center' }}>KEY</th>
										<th style={{ textAlign: 'center' }}>ACTION</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
											<div style={{ display: 'flex', gap: '4px' }}>
												<kbd>▲</kbd>
											</div>
											<div style={{ display: 'flex', gap: '4px' }}>
												<kbd>◄</kbd>
												<kbd>▼</kbd>
												<kbd>►</kbd>
											</div>
										</td>
										<td>ROBOT MOVEMENT</td>
									</tr>
									<tr>
										<td style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
											<div style={{ display: 'flex', gap: '4px' }}>
												<kbd>W</kbd>
											</div>
											<div style={{ display: 'flex', gap: '4px' }}>
												<kbd>A</kbd>
												<kbd>S</kbd>
												<kbd>D</kbd>
											</div>
										</td>
										<td>PAN TILT CAMERA</td>
									</tr>
									<tr>
										<td><kbd>Q</kbd></td>
										<td>BRUSH: ON/OFF</td>
									</tr>
									<tr>
										<td><kbd>F</kbd><kbd>V</kbd></td>
										<td>BRUSH: UP/DOWN</td>
									</tr>
									<tr>
										<td><kbd>Shift + R</kbd></td>
										<td>RESET ODOMETER</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</Modal.Body>
			</Modal>

		</div>
	);
}

function getScaledValue(value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) {
	let targetRange = targetRangeMax - targetRangeMin;
	let sourceRange = sourceRangeMax - sourceRangeMin;
	return ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin;
}

export default App;
