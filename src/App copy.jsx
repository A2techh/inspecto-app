import React, { useState, useEffect, useMemo, useRef } from "react";
import * as ROSLIB from "roslib";
import { Joystick } from "react-joystick-component";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import { BsJoystick } from "react-icons/bs";
import logo from "./assets/a2tech.png";
import Draggable from "react-draggable";
import { RiDragMoveFill } from "react-icons/ri";

// import "joypad.js";
const maxLinear = 0.5;
const maxAngular = 1.0;
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
function App() {
	const [intervalId, setIntervalId] = useState(0);
	const [gamepadState, setGamepadState] = useState(false);
	const [showJoystick, setShowJoystick] = useState(false);

	const [connected, setConnected] = useState(false);

	const ros = useRef(null);

	const listener = useRef(null);
	const cmdVelPub = useRef(null);
	const brushArmPub = useRef(null);
	const brushSpin = useRef(null);

	const [internalTemp, setInternalTemp] = useState(32.4);

	const brushState = useRef(false);

	const [cam, setCam] = useState(1);
	const [url, setUrl] = useState("");

	// const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });
	// const ros = useMemo(() => new ROSLIB.Ros({ url: "ws://localhost:9090" }), []); //connect to websocket server

	useEffect(() => {
		const intervalId = setInterval(() => {
			var gamepads = navigator.getGamepads();
			// console.log(gamepads[0]);
			if (!gamepads[0]) {
				return;
			}

			if (gamepads[0].axes[0] !== 0 || gamepads[0].axes[1] !== 0 || gamepads[0].axes[2] !== 0) {
				// console.log("move");
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
						z: getScaledValue(gamepads[0].axes[0], -1, 1, maxAngular, -maxAngular),
					},
				});
				if (gamepads[0].axes[2] !== 0) {
					joyTwist.angular.z = getScaledValue(gamepads[0].axes[2], -1, 1, maxAngular, -maxAngular);
				}

				cmdVelPub.current.publish(joyTwist);
			} else if (move) {
				move = false;
				// console.log("stop");
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
		ros.current = new ROSLIB.Ros({ url: "ws://localhost:9090" });
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
			}
		});

		window.addEventListener("keyup", (evt) => {
			if (evt.code === "KeyW") {
				console.log("brush stop");
				handleBrushArm("stop");
			} else if (evt.code === "KeyS") {
				console.log("brush stop");
				handleBrushArm("stop");
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

		cmdVelPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/cmd_vel",
			messageType: "geometry_msgs/Twist",
		});

		brushArmPub.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/brush/up_down",
			messageType: "std_msgs/String",
		});

		brushSpin.current = new ROSLIB.Topic({
			ros: ros.current,
			name: "/brush/spin",
			messageType: "std_msgs/Bool",
		});
	}, [connected]);

	useEffect(() => {
		// console.log(canvas);
		if (cam == 1) {
			setUrl("http://192.168.0.173:8081/stream");
		} else if (cam == 2) {
			setUrl("http://192.168.0.173:8082/stream");
		} else if (cam == 3) {
			setUrl("http://192.168.0.173:8083/stream");
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

	return (
		<div
			className="w-screen h-screen bg-slate-800 overflow-hidden"
			onContextMenu={(e) => {
				e.preventDefault();
			}}
		>
			<div className="flex flex-col w-full h-full">
				<div className="flex bg-slate-500 w-full h-16 justify-between px-3">
					<div className="flex h-full items-center gap-2">
						<div className="h-full">
							<img className="object-scale-down h-full" src={logo}></img>
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

				<div className="flex flex-col w-full h-[70%] items-center justify-center gap-4">
					<img className="" src={url}></img>
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
				</div>

				<div className="flex flex-col w-full h-[30%] items-center justify-center invisible md:visible">
					<div
						className="bg-white rounded-sm  shadow-xl p-4 opacity-30 hover:opacity-100 tooltip tooltip-top"
						data-tip={"Keyboard Shortcut"}
					>
						<div className="flex justify-center">
							<h2 className="text-black font-extrabold ">SHORTCUT KEY</h2>
						</div>
						<div className="flex flex-col items-start">
							<h3 className="text-black font-semibold ">{"BRUSH SPIN:"}</h3>
							<h3 className="text-black font-normal ">{"ON/OFF : Q"}</h3>
							<h3 className="text-black font-semibold ">{"BRUSH UP/DOWN:"}</h3>
							<h3 className="text-black font-normal  ">{"UP : W"}</h3>
							<h3 className="text-black font-normal  ">{"DOWN : S"}</h3>
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
										size={100}
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
		</div>
	);
}

function getScaledValue(value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) {
	let targetRange = targetRangeMax - targetRangeMin;
	let sourceRange = sourceRangeMax - sourceRangeMin;
	return ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin;
}

export default App;
