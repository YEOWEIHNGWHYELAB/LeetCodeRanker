import React, { Component } from 'react';
import { request } from 'graphql-request';
import ChartRace from 'react-chart-race';
import './styles/App.css';
 
export default class App extends Component{
  constructor(props) {
    super(props);

    this.state = {
      dataQnCount: [],
      friendUsernames: [],
      inspirationUsernames: [],
      myUsername: "YEOWEIHNGWHYELAB",
      newUsername: '', // added for input field
    };

    this.handleChange();
    
    setInterval(() => {
      this.handleChange();
    }, 2000);
  }

  getRandomColor() {
    // generate a random integer between 0 and 16777215
    const randomInt = Math.floor(Math.random() * 16777216);
  
    // convert the integer to a hexadecimal string and pad with leading zeros
    const hexString = randomInt.toString(16).padStart(6, "0");
  
    // return the hexadecimal string with a leading #
    return "#" + hexString;
  }
 
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  handleAddUsername = async () => {
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

    let variables = {username: this.state.newUsername}
    const response = await this.getQuestionCompletedCount(query, variables);
    
    if (response) {
      const currFriendUsernames = this.state.friendUsernames;
      const currNewUsername = this.state.newUsername;

      if (currNewUsername && !currFriendUsernames.includes(currNewUsername)) {
        this.setState({
          friendUsernames: [...currFriendUsernames, currNewUsername],
        });
      }
    }
  };

  handleRemoveUsername = () => {
    if (this.state.friendUsernames.length !== 0) {
      const currFriendUsernames = this.state.friendUsernames;
      const newUsers = currFriendUsernames.filter((user) => user != this.state.newUsername);
      
      this.setState(
        { friendUsernames: [...newUsers] }
      );
    }
  };

  handleNewUsernameChange = (event) => {
    this.setState({ newUsername: event.target.value });
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.friendUsernames !== this.state.friendUsernames) {
      localStorage.setItem('friendUsernames', JSON.stringify(this.state.friendUsernames));
    }
  }
 
  async handleChange() {
    let dataQnCount = [];
    dataQnCount = await this.getGraphQLData();

    this.setState({ dataQnCount });
  }

  async getQuestionCompletedCount(query, variables) {
    try {
      const dataQnCount = await request('/graphql', query, variables);
      const solvedQuestions = dataQnCount.matchedUser.submitStats.acSubmissionNum;
      const allSolvedQuesetionsCount = solvedQuestions[0].count;
      
      return {title: variables.username, value: allSolvedQuesetionsCount};
    } catch (error) {
      console.error(`Error fetching LeetCode data: ${error}`);
    }
  }

  async getUsernames() {
    const friendUsernameFile = "./friends.txt";
    const inspirationUsernameFile = "./inspirations.txt";

    await fetch(friendUsernameFile)
      .then(response => response.text())
      .then(text => {
        this.state.friendUsernames = text.trim().split('\n');
      })
      .catch(error => {
        console.error(error);
      });

    this.state.friendUsernames.push(this.state.myUsername);

    await fetch(inspirationUsernameFile)
      .then(response => response.text())
      .then(text => {
        this.state.inspirationUsernames = text.trim().split('\n');
      })
      .catch(error => {
        console.error(error);
      });
  }

  async getGraphQLData() {
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

    const allUsername = [...this.state.friendUsernames, ...this.state.inspirationUsernames];

    if (allUsername.length !== 0) {
      for (const username of allUsername) {
        const variables = { username };
        const response = await this.getQuestionCompletedCount(query, variables);

        if (username !== this.state.myUsername) {
          dataQnCount.push({id: count, title: username, value: response.value, color: this.getRandomColor()});
        } else {
          dataQnCount.push({id: count, title: "YOU", value: response.value, color: "#FF0000"});
        }

        count += 1;
      }
    }

    return dataQnCount;
  }

  async componentDidMount() {
    // await this.getUsernames();
    const friendUsernames = JSON.parse(localStorage.getItem('friendUsernames')) || [];
    this.setState({ friendUsernames });
  }

  render() {
    return(
      <div>
        <h1>
          LeetCode Solved Count Rankings
        </h1>

        <h2>
          Hello {this.state.myUsername}
        </h2>

        <div>
          <input
            type="text"
            placeholder="Enter a username"
            value={this.newUsername}
            onChange={this.handleNewUsernameChange}
          />
          <button onClick={this.handleAddUsername}>Add</button>
          <button onClick={this.handleRemoveUsername}>Remove</button>
        </div>

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
