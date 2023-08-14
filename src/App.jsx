import React, { useState, useEffect, useMemo, useRef } from "react";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { BsJoystick } from "react-icons/bs";
import logo from "./assets/a2tech.png";
import Draggable from "react-draggable";
// import { RiDragMoveFill } from "react-icons/ri";
import { saveAs } from "file-saver";
import { Button, Alert, Modal } from "react-daisyui";
import { GoAlert } from "react-icons/go";

// import "joypad.js";
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

let videoStream = null;
let mediaRecorder = null;
let chunks = [];
function App() {
	const [intervalId, setIntervalId] = useState(0);
	const [gamepadState, setGamepadState] = useState(false);
	const [showJoystick, setShowJoystick] = useState(false);

	const [connected, setConnected] = useState(false);
	const [temperature, setTemperature] = useState(0.0);
	const [edgeFront, setEdgeFront] = useState(true);
	const [edgeRear, setEdgeRear] = useState(true);

	const ros = useRef(null);

	const listener = useRef(null);
	const cmdVelPub = useRef(null);
	const brushArmPub = useRef(null);
	const brushSpin = useRef(null);
	const temperatureSub = useRef(null);
	const edgeFrontSub = useRef(null);
	const edgeRearSub = useRef(null);

	const [internalTemp, setInternalTemp] = useState(32.4);

	const brushState = useRef(false);

	const [cam, setCam] = useState(1);
	const [url, setUrl] = useState("");

	const canvasRef = useRef();

	const [isRecording, setIsRecording] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);

	// const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });
	// const ros = useMemo(() => new ROSLIB.Ros({ url: "ws://localhost:9090" }), []); //connect to websocket server

	// useEffect(() => {
	// 	const intervalId = setInterval(() => {
	// 		if (arrowUp || arrowDown || arrowLeft || arrowRight) {
	// 			console.log("move");
	// 			arrowMove = true;
	// 			let joyTwist = new ROSLIB.Message({
	// 				linear: {
	// 					x: 0.0,
	// 					y: 0.0,
	// 					z: 0.0,
	// 				},
	// 				angular: {
	// 					x: 0.0,
	// 					y: 0.0,
	// 					z: 0.0,
	// 				},
	// 			});

	// 			if (arrowUp) {
	// 				if (arrowLeft) {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: maxAngular,
	// 						},
	// 					});
	// 				} else if (arrowRight) {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: -maxAngular,
	// 						},
	// 					});
	// 				} else if (arrowDown) {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 					});
	// 				} else {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 					});
	// 				}
	// 			} else if (arrowDown) {
	// 				if (arrowLeft) {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: -maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: -maxAngular,
	// 						},
	// 					});
	// 				} else if (arrowRight) {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: -maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: maxAngular,
	// 						},
	// 					});
	// 				} else {
	// 					joyTwist = new ROSLIB.Message({
	// 						linear: {
	// 							x: -maxLinear,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 						angular: {
	// 							x: 0.0,
	// 							y: 0.0,
	// 							z: 0.0,
	// 						},
	// 					});
	// 				}
	// 			} else if (arrowLeft) {
	// 				joyTwist = new ROSLIB.Message({
	// 					linear: {
	// 						x: 0.0,
	// 						y: 0.0,
	// 						z: 0.0,
	// 					},
	// 					angular: {
	// 						x: 0.0,
	// 						y: 0.0,
	// 						z: maxAngular,
	// 					},
	// 				});
	// 			} else if (arrowRight) {
	// 				joyTwist = new ROSLIB.Message({
	// 					linear: {
	// 						x: 0.0,
	// 						y: 0.0,
	// 						z: 0.0,
	// 					},
	// 					angular: {
	// 						x: 0.0,
	// 						y: 0.0,
	// 						z: -maxAngular,
	// 					},
	// 				});
	// 			}
	// 			cmdVelPub.current.publish(joyTwist);
	// 		} else if (arrowMove) {
	// 			arrowMove = false;
	// 			console.log("stop");
	// 			const joyTwist = new ROSLIB.Message({
	// 				linear: {
	// 					x: 0.0,
	// 					y: 0.0,
	// 					z: 0.0,
	// 				},
	// 				angular: {
	// 					x: 0.0,
	// 					y: 0.0,
	// 					z: 0.0,
	// 				},
	// 			});
	// 			cmdVelPub.current.publish(joyTwist);
	// 		}
	// 	}, 50);

	// 	return () => clearInterval(intervalId);
	// }, []);

	// console.log("modal visible", modalVisible);

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

		return () => {};
	}, []);

	useEffect(() => {
		const context = canvasRef.current.getContext("2d");
		const image = new Image();
		image.crossOrigin = "anonymous";
		image.src = url;

		// const animate = () => {
		// 	const date = new Date();
		// 	const text = date.toLocaleTimeString();
		// 	const cw = canvasRef.current.width;
		// 	const ch = canvasRef.current.height;
		// 	context.drawImage(image, 0, 0, 1280, 720);
		// 	context.font = "30px Georgia";
		// 	const textWidth = context.measureText(text).width;
		// 	context.globalAlpha = 1.0;
		// 	context.fillStyle = "black";
		// 	context.fillText(text, cw - textWidth - 10, ch - 20);
		// 	if (cam === 1) {
		// 		const text = "Top Camera";
		// 		const textWidth = context.measureText(text).width;
		// 		context.fillText(text, cw - textWidth - 10, 30);
		// 	} else if (cam === 2) {
		// 		const text = "Front Camera";
		// 		const textWidth = context.measureText(text).width;
		// 		context.fillText(text, cw - textWidth - 10, 30);
		// 	} else if (cam === 3) {
		// 		const text = "Rear Camera";
		// 		const textWidth = context.measureText(text).width;
		// 		context.fillText(text, cw - textWidth - 10, 30);
		// 	}
		// 	requestAnimationFrame(animate);
		// };

		// requestAnimationFrame(animate);

		const canvasInterval = setInterval(() => {
			const date = new Date();
			const text = date.toLocaleTimeString();
			const cw = canvasRef.current.width;
			const ch = canvasRef.current.height;
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
			} else if (move) {
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
	}, []);

	useEffect(() => {
		if (ros.current) {
			return;
		}
		// ros.current = new ROSLIB.Ros({ url: "ws://192.168.0.188:8080" });
		ros.current = new ROSLIB.Ros({ url: "ws://192.168.88.2:8080" });
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
			// console.log(evt.code);
			if (evt.code === "Digit1") {
				setCam(1);
			} else if (evt.code === "Digit2") {
				setCam(2);
			} else if (evt.code === "Digit3") {
				setCam(3);
			} else if (evt.code === "KeyW") {
				console.log("brush up");
				handleBrushArm("up");
			} else if (evt.code === "KeyS") {
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
			}
		});

		window.addEventListener("keyup", (evt) => {
			if (evt.code === "KeyW") {
				console.log("brush stop");
				handleBrushArm("stop");
			} else if (evt.code === "KeyS") {
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
	}, [connected]);

	useEffect(() => {
		if (!edgeFront) {
			setModalVisible(true);
		} else {
			setModalVisible(false);
		}
	}, [edgeFront]);
	useEffect(() => {
		if (!edgeRear) {
			setModalVisible(true);
		} else {
			setModalVisible(false);
		}
	}, [edgeRear]);

	useEffect(() => {
		// console.log(canvas);
		if (cam == 1) {
			setUrl("http://192.168.88.2:8081/stream");
		} else if (cam == 2) {
			setUrl("http://192.168.88.2:8082/stream");
		} else if (cam == 3) {
			setUrl("http://192.168.88.2:8083/stream");
		}
	}, [cam]);

	const handleMove = (evt) => {
		// console.log(evt.y);
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

	return (
		<div
			className="w-screen h-screen bg-slate-800 overflow-hidden"
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div className="flex flex-col w-full h-full">
				<div className="flex bg-slate-500 w-full h-12 justify-between px-3">
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
					<div></div>
					<div className="flex h-full items-center gap-2">
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

				<div className="flex flex-col w-full h-[90%] items-center justify-center gap-4">
					{/* <img className="object-contain h-[85%]" src={url}></img> */}
					<canvas className="object-contain h-[90%]" ref={canvasRef} width={1280} height={720}></canvas>
					<div className="flex justify-between gap-40">
						<div className="flex justify-center gap-2">
							<button
								className="btn"
								onClick={() => {
									setCam(1);
								}}
							>
								{"Cam 1 (1)"}
							</button>
							<button
								className="btn"
								onClick={() => {
									setCam(2);
								}}
							>
								{"Cam 2 (2)"}
							</button>
							<button
								className="btn"
								onClick={() => {
									setCam(3);
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

				<div className="flex flex-col w-full h-[10%] items-center justify-center invisible md:visible">
					<div
						className="bg-white rounded-sm  shadow-xl p-4 opacity-30 hover:opacity-100 tooltip tooltip-top"
						data-tip={"Keyboard Shortcut"}
					>
						<div className="flex justify-center">
							<h2 className="text-black font-extrabold ">SHORTCUT KEY</h2>
						</div>
						<div className="flex items-start gap-10">
							<div className="flex gap-2">
								<h3 className="text-black font-semibold ">{"BRUSH SPIN:"}</h3>
								<h3 className="text-black font-normal ">{"ON/OFF : Q"}</h3>
							</div>

							<div className="flex gap-2">
								<h3 className="text-black font-semibold ">{"BRUSH UP/DOWN:"}</h3>
								<h3 className="text-black font-normal  ">{"UP : W"}</h3>
								<h3 className="text-black font-normal  ">{"DOWN : S"}</h3>
							</div>
						</div>
					</div>
				</div>

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
								<strong>
									<div className="flex justify-center items-start hover:cursor-move text-black">Brush</div>
								</strong>
								<div className="flex gap-2">
									<div className="flex flex-col gap-2">
										<button
											// onClick={() => {
											// 	console.log("clicked");
											// }}
											onTouchStart={() => {
												console.log("start");
												handleBrushArm("up");
											}}
											onTouchEnd={() => {
												console.log("stop");
												handleBrushArm("stop");
											}}
										>
											<AiOutlineArrowUp color="black" size={35} />
										</button>
										<button
											onTouchStart={() => {
												// console.log("start");
												handleBrushArm("down");
											}}
											onTouchEnd={() => {
												console.log("stop");
												handleBrushArm("stop");
											}}
										>
											<AiOutlineArrowDown color="black" size={35} />
										</button>
									</div>
									<div className="flex items-center">
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
		</div>
	);
}

function getScaledValue(value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) {
	let targetRange = targetRangeMax - targetRangeMin;
	let sourceRange = sourceRangeMax - sourceRangeMin;
	return ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin;
}

export default App;