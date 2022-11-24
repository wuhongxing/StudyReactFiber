import React, { useState, useRef, useEffect, useDeferredValue } from "react";
import ReactDOM from "react-dom";

export default function BatchUpdateComponent() {
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(0);
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
  });

  const syncClickHandle = () => {
    setFirst((prev) => prev + 1);
    setSecond((prev) => prev + 1);
  };

  const syncClickHandleThreeTimes = () => {
    setFirst((prev) => prev + 1);
    setFirst((prev) => prev + 1);
    setFirst((prev) => prev + 1);
  };

  const syncClickHandleThreeTimesByValue = () => {
    setFirst(first + 1);
    console.log(first)
    // setFirst(first + 1);
    // console.log(first)
    // setFirst(first + 1);
    // console.log(first)
  };
  const asyncClickHandleThreeTimesByValue = () => {
    setTimeout(() => {
      setFirst(first + 1);
      console.log(first)
    }, 0);
    // Promise.resolve().then(() => {
    //   setFirst(first + 1);
    //   console.log(first)
    //   setFirst(first + 1);
    //   console.log(first)
    //   setFirst(first + 1);
    //   console.log(first)
    // })
  };

  const asyncClickHandle = () => {
    Promise.resolve().then(() => {
      setFirst((prev) => prev + 1);
      setSecond((prev) => prev + 1);
      fn2()
    });
  };

  const asyncClickHandleWithBatchedUpdates = () => {
    Promise.resolve().then(() => {
      ReactDOM.unstable_batchedUpdates(() => {
        setFirst((prev) => prev + 1);
        setSecond((prev) => prev + 1);
        fn2()
      })
    });
  };

  const fn2 = () => {
    setFirst((prev) => prev + 1)
  }

  const onClearHandle = () => {
    setFirst(0);
    setSecond(0);
    renderCount.current = 0;
  };

  return (
    <div>
      render count {renderCount.current}
      <div>first value: {first}</div>
      <div>second value: {second}</div>
      <p>
        <button onClick={syncClickHandle}>sync setState</button>
        <button onClick={syncClickHandleThreeTimes}>sync setState three times</button>
        <button onClick={syncClickHandleThreeTimesByValue}>sync setState three times by value</button>
        <button onClick={asyncClickHandleThreeTimesByValue}>async setState three times by value</button>
        <button onClick={asyncClickHandle}>async setState</button>
        <button onClick={asyncClickHandleWithBatchedUpdates}>async setState with batched update</button>
        <button onClick={onClearHandle}>clear</button>
      </p>
    </div>
  );
}


ReactDOM.render(
  <BatchUpdateComponent />,
  document.getElementById('root')
)
