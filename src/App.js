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
      { id: 1, title: 'Kayseri', value: this.state.allSolvedQuesetionsCount, color: '#3fc42d' },
      { id: 2, title: 'Muğla', value: this.getRandomInt(10, 90), color: '#c33178' },
      { id: 3, title: 'Uşak', value: this.getRandomInt(10, 1000), color: '#423bce' },
      { id: 4, title: 'Sivas', value: 58, color: '#c8303b' },
      { id: 5, title: 'Konya', value: 16, color: '#2c2c2c' }
    ];

    this.setState({ data });
  }

  async getQuestionCompletedCount(query, variables) {
    try {
      const dataQnCount = await request('/graphql', query, variables);
      const solvedQuestions = dataQnCount.matchedUser.submitStats.acSubmissionNum;
      const allSolvedQuesetionsCount = solvedQuestions[0].count;
      console.log(variables);
      console.log(allSolvedQuesetionsCount);
      this.setState({ allSolvedQuesetionsCount });  
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
        this.state.friendUsernames = text.trim().split('\n');
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

    if (this.state.friendUsernames.length != 0) {
      for (const username of this.state.friendUsernames) {
        const variables = { username };
        await this.getQuestionCompletedCount(query, variables);
      }
    }
  }

  render() {
    return(
      <div>
        <h1>
          LeetCode Solved Rankings
        </h1>

        <ChartRace
          data={this.state.data}
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
