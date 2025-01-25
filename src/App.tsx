import { useEffect, useState } from "react";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const BUILD_TIME_INTERVAL_IN_MINUTE = 150 * 60 * 1000; // 150분

// 한국 시간대를 설정
const KOREA_TIMEZONE = "Asia/Seoul";

function App() {
  const [currentGuildTime, setCurrentGuildTime] = useState<string | undefined>(
    ""
  );
  const [ranges, setRanges] = useState<{ cycle: number; time: string }[]>();
  const [currentCycle, setCurrentCycle] = useState<{
    cycle: number;
    isFuture: boolean;
  }>();

  useEffect(() => {
    const savedGuildTime = localStorage.getItem("guild-time");
    if (savedGuildTime) {
      setCurrentGuildTime(savedGuildTime);
    }
  }, []);

  useEffect(() => {
    const currentTime = dayjs().tz(KOREA_TIMEZONE);
    const creationTime = dayjs(currentGuildTime).tz(KOREA_TIMEZONE);

    // 시간 차이 계산 (밀리초 단위)
    const timeDifference = currentTime.valueOf() - creationTime.valueOf();

    // 몇 주기인지 계산
    const cycleNumber = Math.ceil(
      Math.abs(timeDifference) / BUILD_TIME_INTERVAL_IN_MINUTE
    );

    setCurrentCycle({ cycle: cycleNumber, isFuture: timeDifference < 0 });

    if (currentGuildTime) {
      updateLocalStorage(currentGuildTime);
      getCycleTimeRanges(currentGuildTime);
    }
  }, [currentGuildTime]);

  const getCycleTimeRanges = (cityCreationTime: string) => {
    if (!cityCreationTime) return;

    const creationTime = new Date(cityCreationTime);

    const ranges = [];

    for (let i = -5; i <= 5; i++) {
      const cycleDate = new Date(
        creationTime.getTime() + i * BUILD_TIME_INTERVAL_IN_MINUTE
      );
      ranges.push({ cycle: i, time: cycleDate.toISOString() });
    }

    setRanges(ranges);
  };

  const updateLocalStorage = (value: string) => {
    localStorage.setItem("guild-time", value);
  };

  return (
    <div className="App">
      <h1>대항해시대 길드 개척지 시간 계산기</h1>
      <p>현재 시간 : {dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>

      <p>길드 개척 시간 (개척시간을 입력해주세요) </p>
      <input
        type="datetime-local"
        value={currentGuildTime}
        onChange={(e) => {
          setCurrentGuildTime(e.target.value);
        }}
      />

      {currentGuildTime && (
        <div>
          <p>
            현재 개척주기는 {currentCycle?.isFuture ? "+" : "-"}{" "}
            {currentCycle?.cycle}주기 입니다.
          </p>

          <div>
            <h2>주기별 시간</h2>
            <ul>
              {ranges?.map((range) => (
                <li key={range.cycle}>
                  {range.cycle}주기 :{" "}
                  {dayjs(range.time).format("YYYY-MM-DD HH:mm:ss")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
