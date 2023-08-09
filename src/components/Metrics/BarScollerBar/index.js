import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Bar } from '@ant-design/plots';
import {request} from "@@/plugin-request/request";

const DemoBar = (props) => {
  const [data, setData] = useState([]);
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  useEffect(() => {
    asyncFetch();
  }, []);
  const {api,metrics} = props

  const asyncFetch = () => {
       request('http://127.0.0.1:5000'+'/metric/get_total_fix_intensity')
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    yField: 'email',
    xField: metrics,
    width:50,
    yAxis: {
      label: {
        autoRotate: false,
      },
    },
    scrollbar: {
      type: 'vertical',
    },
  };

  return <Bar {...config} />;
};

// ReactDOM.render(<DemoBar />, document.getElementById('container'));
export default DemoBar
