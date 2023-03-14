import React, { Component } from 'react';
import ChartRace from 'react-chart-race';
 
export default class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };

    this.handleChange();
    
    setInterval(() => {
      this.handleChange();
    }, 2000);
  }
 
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
 
  handleChange() {
    const data = [
      { id: 0, title: 'Ayfonkarahisar', value: this.getRandomInt(10, 90), color: '#50c4fe' },
      { id: 1, title: 'Kayseri', value: 38, color: '#3fc42d' },
      { id: 2, title: 'Muğla', value: this.getRandomInt(10, 90), color: '#c33178' },
      { id: 3, title: 'Uşak', value: this.getRandomInt(10, 90), color: '#423bce' },
      { id: 4, title: 'Sivas', value: 58, color: '#c8303b' },
      { id: 5, title: 'Konya', value: 16, color: '#2c2c2c' }
    ];

    this.setState({ data });
  }
 
  render(){
    return(
      <div>
        <ChartRace
          data={this.state.data}
          backgroundColor='#000'
          width={760}
          padding={12}
          itemHeight={58}
          gap={12}
          titleStyle={{ font: 'normal 400 13px Arial', color: '#fff' }}
          valueStyle={{ font: 'normal 400 11px Arial', color: 'rgba(255,255,255, 0.42)' }}
        />
      </div>
    );
  }
 
}