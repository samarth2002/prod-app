"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { REWARDS } from "@/constants/constants";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ArrowLeft } from "lucide-react";

import {
  incrementPoints,
  decrementPoints,
  setPointsBalance,
} from "@/store/pointsSlice";


const TIME_UNIT = 900;


function RewardsPage() {
  const router = useRouter();
  const [bgImages, setBgImages] = useState(false);
  const [isRewardActive, setIsRewardActive] = useState(false);
  const [totalDuration, setTotalDuration] = useState(TIME_UNIT);
  const [currentTime, setCurrentTime] = useState(totalDuration);
  const [timerPaused, setTimerPaused] = useState(true);
  const [activeReward, setActiveReward] = useState(REWARDS[0]);

  const points = useAppSelector((state)=>state.points.pointsBalance)
  const dispatch = useAppDispatch()

  const radius = 160;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const progress = (currentTime / totalDuration) * circumference;
  const hue = (currentTime / totalDuration) * 120;



  useEffect(() => {
    if (!timerPaused) {
   
      const timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
             setTimerPaused(true);
             setCurrentTime(totalDuration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timerPaused]);

  const handleTimerIncrease = () => {
    if(points-getPointsCost()<=0){
      return;
    }
    setTotalDuration((prev) => prev + TIME_UNIT);
    setCurrentTime((prev) => prev + TIME_UNIT);
  };

  const handleTimerDecrease = () => {
    if (totalDuration <= TIME_UNIT) {
      return;
    }
    setTotalDuration((prev) => prev - TIME_UNIT);
    setCurrentTime((prev) => prev - TIME_UNIT);
  };

  const handleStartTimer = () => {
    dispatch(decrementPoints(getPointsCost()));
    setTimerPaused(false);
  };
  const handleRewardClick = (index: any) => {
    setIsRewardActive(true);
    setActiveReward(REWARDS[index]);
  };
  const getPointsCost = () => {
    return Math.floor(activeReward.unitPoints * (totalDuration / TIME_UNIT));
  };

  const formatTime = (time: any) => {
    let sec = time % 60;
    let min = Math.floor(time / 60) % 60;
    let hour = Math.floor(time / 3600) % 24;

    const secOnesDigit = sec % 10;
    const secTensDigit = Math.floor(sec / 10);
    const minOnesDigit = min % 10;
    const minTensDigit = Math.floor(min / 10);
    const hourOnesDigit = hour % 10;
    const hourTensDigit = Math.floor(hour / 10);

    return `${hourTensDigit}${hourOnesDigit}:${minTensDigit}${minOnesDigit}:${secTensDigit}${secOnesDigit}`;
  };

  return (
    <div className="relative flex flex-col justify-center items-center p-80 bg-black">
      <div className="absolute top-20 left-20">
        <div
          className="p-2 rounded hover:bg-white/30 transition cursor-pointer w-fit"
          onClick={() => router.back()}
        >
          <ArrowLeft color="white" />
        </div>
      </div>
      {!isRewardActive ? (
        <>
          <div className="absolute flex flex-col justify-center items-center top-20">
            <h1 className="font-bold text-3xl text-white">REWARDS</h1>
            <h2 className="text-white">Redeem your reward and have fun</h2>
          </div>
          {REWARDS.map((reward, index) => {
            return (
              <div key={index}>
                <img
                  src={reward.rightImg}
                  alt="PS5 White"
                  className={`absolute top-50 right-20 w-[400px] h-[400px] z-10 transition-all duration-700 ease-in-out ${
                    bgImages
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-10"
                  }`}
                />
                <img
                  src={reward.leftImg}
                  alt="PS5 White"
                  className={`absolute top-50 left-20 w-auto h-[300px] z-10 transition-all duration-700 ease-in-out ${
                    bgImages
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-10"
                  }`}
                />

                <div
                  onMouseEnter={() => setBgImages(true)}
                  onMouseLeave={() => setBgImages(false)}
                  onClick={() => handleRewardClick(index)}
                  className="border border-white p-20 rounded-lg hover:bg-white/20 group transition z-2"
                >
                  <img
                    src={reward.titleLogo}
                    alt="PS5 White"
                    className="w-20 h-20 transition-transform duration-300 ease-in-out group-hover:scale-125"
                  />
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className="flex flex-col justify-center items-center absolute top-20">
          {timerPaused ? (
            <div className="">
              <div className="flex flex-row justify-center items-center border border-2 border-white text-white rounded-md">
                <div
                  className={`border-white border-r-2 p-4 ${
                    totalDuration <= TIME_UNIT ? "text-white/30" : "hover:bg-white/20"
                  }`}
                  onClick={handleTimerDecrease}
                >
                  -15
                </div>
                <div className="p-4">CHOOSE DURATION</div>
                <div
                  className={`border-white border-l-2 p-4 ${
                    points - getPointsCost() <= 0
                      ? "text-white/30"
                      : "hover:bg-white/20"
                  }`}
                  onClick={handleTimerIncrease}
                >
                  +15
                </div>
              </div>
              <div className="flex flex-col mt-12 text-center">
                <h1 className="text-white font-bold text-2xl">
                  TIMER: {formatTime(totalDuration)} MINS
                </h1>
                <h1 className="text-white font-bold text-2xl">
                  <p>POINTS BALANCE: {points} </p>
                  <p>POINTS COST: {getPointsCost()}</p>
                  <p>POINTS AFTER: {points - getPointsCost()}</p>
                </h1>
              </div>
            </div>
          ) : (
            <h1 className="text-white font-bold text-3xl">DO NOT CHEAT</h1>
          )}

          <div className="top-20 flex flex-col items-center justify-center">
            <svg width="500" height="500" viewBox="0 0 500 500">
              <circle
                cx="250"
                cy="250"
                r={radius}
                stroke="gray"
                strokeWidth={strokeWidth}
                fill="none"
              />

              <circle
                cx="250"
                cy="250"
                r={radius}
                stroke={`hsl(${hue}, 100%, 50%)`}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={progress}
                transform="rotate(-90 250 250)"
                strokeLinecap="round"
              />
            </svg>

            {/* Countdown Timer in Center */}
            <div
              className={`absolute text-white text-5xl font-bold ${
                timerPaused && "hover:text-white/80"
              }`}
              onClick={handleStartTimer}
            >
              <p>{timerPaused ? "START" : formatTime(currentTime)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RewardsPage;
