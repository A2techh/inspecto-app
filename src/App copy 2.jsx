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

	// const ros = useRef(null);
	const [ros, setRos] = useState(null);

	const listener = useRef(null);
	const cmdVelPub = useRef(null);
	const brushArmPub = useRef(null);
	const brushSpin = useRef(null);

	const [internalTemp, setInternalTemp] = useState(32.4);

	const brushState = useRef(false);

	const [cam, setCam] = useState(1);
	const [url, setUrl] = useState("");

	const [text, setText] = useState("");

	useEffect(() => {
		if (ros) {
			return;
		}

		const ws = new ROSLIB.Ros({ url: "ws://192.168.0:9090" });

		ws.on("error", function (error) {
			console.log(error);
			setConnected(false);
		});
		ws.on("connection", function () {
			console.log("Connection made!");
			setConnected(true);
		});

		setRos(ws);

		return () => {
			ws.close();
			setRos(null);
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
		console.log("move");
		setText("move");
		// twist = new ROSLIB.Message({
		// 	linear: {
		// 		x: getScaledValue(evt.y, -1, 1, -maxLinear, maxLinear),
		// 		y: 0.0,
		// 		z: 0.0,
		// 	},
		// 	angular: {
		// 		x: 0.0,
		// 		y: 0.0,
		// 		z: getScaledValue(evt.x, -1, 1, maxAngular, -maxAngular),
		// 	},
		// });
	};

	const handleStop = (evt) => {
		console.log("stop");
		setText("stop");
		// twist = new ROSLIB.Message({
		// 	linear: {
		// 		x: 0.0,
		// 		y: 0.0,
		// 		z: 0.0,
		// 	},
		// 	angular: {
		// 		x: 0.0,
		// 		y: 0.0,
		// 		z: 0.0,
		// 	},
		// });

		// cmdVelPub.current.publish(twist);
		// if (intervalId) {
		// 	clearInterval(intervalId);
		// 	setIntervalId(0);
		// 	return;
		// }
	};

	const handleStart = (evt) => {
		console.log("start", evt);
		setText("start");

		// const newIntervalId = setInterval(() => {
		// 	// console.log("update");
		// 	cmdVelPub.current.publish(twist);
		// }, 100);
		// setIntervalId(newIntervalId);
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
		<div className="w-scree h-screen flex justify-center items-center gap-4">
			<Joystick size={100} sticky={false} throttle={10} start={handleStart} move={handleMove} stop={handleStop}></Joystick>
			<h1>{JSON.stringify(text)}</h1>
			<h1>{JSON.stringify(connected)}</h1>
		</div>
	);
}

function getScaledValue(value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) {
	let targetRange = targetRangeMax - targetRangeMin;
	let sourceRange = sourceRangeMax - sourceRangeMin;
	return ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin;
}

export default App;
