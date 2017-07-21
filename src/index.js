import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './bootstrap/css/bootstrap.min.css';
import './bootstrap/css/bootstrap-theme.min.css';
import registerServiceWorker from './registerServiceWorker';


const getItem = () => {
    return new Promise(function (resolve, reject) {
        var url = "https://randomuser.me/api";
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                resolve(xmlHttp.responseText);
            }
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    });
};

class DisplayUser extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: []
        };
        this.getUserProfiles(props.count);
    }

    saveItem(responseText) {
        const that = this;
        return new Promise(function (resolve, reject) {
            const
                response = JSON.parse(responseText),
                {first : firstName, last : lastName} = response.results[0].name,
                image = response.results[0].picture.medium,
                dob = response.results[0].dob,
                phone = response.results[0].phone,
                email = response.results[0].email,
                user = {
                    firstName,
                    lastName,
                    image,
                    phone,
                    email
                },
                newState = {users: [...that.state.users.slice(0), user]};
            that.setState(newState);
            resolve();
        });
    }

    componentWillReceiveProps(props) {
        if (props.count === this.state.users.length) {
            return
        }

        if (props.count < this.state.users.length) {
            const newState = {users: this.state.users.slice(0, props.count)};
            this.setState(newState);
        } else {
            this.getUserProfiles(props.count - this.state.users.length);
        }
    }

    getUserProfiles = (count) => {
        const that = this;

        function getMore() {
            return getItem().then((responseText) => {
                count--;
                return that.saveItem(responseText).then(count <= 0 ? undefined : getMore);

            });
        }

        return getMore();
    };

    render() {

        const userList = (this.state.users).map((user, index) => {
            const width = 100/(this.props.numberOfCols);
            const {firstName, lastName, image, email, phone} = user;
            return (<li className="userprofiles__user" style={{width: width + '%'}}  key={index}>
                <div><img className="userprofiles__image" src={image}/></div>
                <div className="userprofiles__details">
                    <div className="userprofiles__name">{firstName + ' ' + lastName} </div>
                    <div className="userprofiles__email">{email}</div>
                    <div className="userprofiles__phone">{phone}</div>
                </div>
            </li>);
        });

        return (
            <ul className="userprofiles col-xs-10">
                {userList}
            </ul>
        )
    }
}

class InputForm extends React.Component {

    onSubmitInput = () => {
        const numberOfRows = this.rowInput.value,
            numberOfCols = this.colInput.value;
        if (numberOfRows && numberOfCols) {
            this.props.submitInputs(parseInt(numberOfRows), parseInt(numberOfCols));
        }
    }

    render() {
        return (
            <div className="form-group input-form col-xs-2">
                <div>
                    <div className="input-form__input"> Rows: <input className="form-control input-sm"
                                                                     ref={row=>{this.rowInput = row}} type="number"/>
                    </div>
                    <div className="input-form__input"> Columns: <input className="form-control input-sm"
                                                                     ref={col=>{this.colInput = col}} type="number"/>
                    </div>
                </div>
                <button className="btn btn-primary submit" onClick={this.onSubmitInput}> Submit</button>
            </div>
        );
    }
}

class RandomUserApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            numberOfRows: 4,
            numberOfCols: 4
        }
    }

    submitInputs = (numberOfRows, numberOfCols) => {
        if(numberOfRows >=0 && numberOfCols>=0) {
            this.setState({
                numberOfRows,
                numberOfCols
            });
        }
    };

    render() {
        const {numberOfRows, numberOfCols} = this.state;
        return (
            <div className="randomUserApp">
                <InputForm submitInputs={this.submitInputs}/>
                <DisplayUser numberOfCols={numberOfCols} count={numberOfRows * numberOfCols}/>
            </div>
        );
    }
}

ReactDOM.render(<RandomUserApp />, document.getElementById('root'));
registerServiceWorker();
