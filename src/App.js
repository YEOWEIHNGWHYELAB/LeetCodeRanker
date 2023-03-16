import React, { Component } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import { request } from 'graphql-request';
import ChartRace from 'react-chart-race';
import './styles/App.css';
 
export default class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      dataQnCount: [],
      friendUsernames: [],
      inspirationUsernames: [],
      myUsername: "YEOWEIHNGWHYELAB"
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
 
  async handleChange() {
    let dataQnCount = [];
    dataQnCount = await this.componentDidMount();

    this.setState({ dataQnCount });
  }

  async getQuestionCompletedCount(query, variables) {
    try {
      const dataQnCount = await request('/graphql', query, variables);
      const solvedQuestions = dataQnCount.matchedUser.submitStats.acSubmissionNum;
      const allSolvedQuesetionsCount = solvedQuestions[0].count;
      
      // console.log(variables.username);
      // console.log(allSolvedQuesetionsCount);
      
      return {title: variables.username, value: allSolvedQuesetionsCount};
    } catch (error) {
      console.error(`Error fetching LeetCode data: ${error}`);
    }
  }

  async getUsernames() {
    const friendUsernameFile = "./friends.txt";
    const inspirationUsernameFile = "./inspiration.txt";

    await fetch(friendUsernameFile)
      .then(response => response.text())
      .then(text => {
        this.state.friendUsernames = text.trim().split('\n');
      })
      .catch(error => {
        console.error(error);
      });

    await fetch(inspirationUsernameFile)
      .then(response => response.text())
      .then(text => {
        this.state.inspirationUsernames = text.trim().split('\n');
      })
      .catch(error => {
        console.error(error);
      });
  }

  async componentDidMount() {
    await this.getUsernames();

    const query = `
      query GetUserStats($username: String!) 
      {
        matchedUser(username: $username) 
        {
            username
            submitStats: submitStatsGlobal 
            {
                acSubmissionNum 
                {
                    difficulty
                    count
                    submissions
                }
            }
        }
      }
    `;
    
    let count = 0;
    let dataQnCount = [];

    if (this.state.friendUsernames.length != 0) {
      for (const username of this.state.friendUsernames) {
        const variables = { username };
        const response = await this.getQuestionCompletedCount(query, variables);
        
        // console.log(response);

        dataQnCount.push({id: count, title: username, value: response.value, color: '#FF0000' });

        count += 1;
      }
    }

    console.log(dataQnCount);

    return dataQnCount;
  }

  render() {
    return(
      <div>
        <h1>
          LeetCode Solved Rankings
        </h1>

        <ChartRace
          data={this.state.dataQnCount}
          backgroundColor='#000'
          padding={12}
          itemHeight={30} // or any smaller value
          width={window.innerWidth}
          gap={12}
          titleStyle={{ font: 'normal 400 13px Arial', color: '#fff' }}
          valueStyle={{ font: 'normal 400 11px Arial', color: 'rgba(255,255,255, 0.42)' }}
        />
      </div>
    );
  }
}
