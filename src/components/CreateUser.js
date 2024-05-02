import React, { Component } from 'react';
import axios from 'axios';

export default class CreateUser extends Component {
    state = {
        users: [],
        username: '',
        error: '',
        successMessage: '',
        isModalOpen: false,
        userToDelete: null
    }

    async componentDidMount() {
        this.getUsers();
    }

    getUsers = async () => {
        const res = await axios.get('http://localhost:4000/api/users');
        this.setState({ users: res.data });
    }

    onChangeUsername = (e) => {
        this.setState({
            username: e.target.value,
            error: '',
            successMessage: ''
        });
    }

    onSubmit = async e => {
        e.preventDefault();
        const { username } = this.state;

        if (!username) {
            this.setState({ error: 'Please enter a username.' });
            return;
        }
        if (username.length < 3) {
            this.setState({ error: 'Username must be at least 3 characters long.' });
            return;
        }

        const userExists = this.state.users.some(user => user.username === username);
        if (userExists) {
            this.setState({ error: 'Username already exists.' });
            return;
        }

        try {
            await axios.post('http://localhost:4000/api/users', { username });
            this.setState({
                username: '',
                successMessage: 'User created successfully!',
                error: ''
            });
            this.getUsers();
        } catch (error) {
            this.setState({
                error: 'Failed to create user.',
                successMessage: ''
            });
        }
    }

    openModal = (userId) => {
        this.setState({
            isModalOpen: true,
            userToDelete: userId
        });
    }

    closeModal = () => {
        this.setState({
            isModalOpen: false,
            userToDelete: null
        });
    }

    deleteUser = async () => {
        const { userToDelete } = this.state;
        await axios.delete(`http://localhost:4000/api/users/${userToDelete}`);
        this.getUsers();
        this.closeModal();
    }

    render() {
        return (
            <div className="row">
                <div className="col-md-4">
                    <div className="card card-body">
                        <h3>Create New User</h3>
                        <form onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={this.state.username}
                                    onChange={this.onChangeUsername}
                                />
                                {this.state.error && <div style={{ color: 'red' }}>{this.state.error}</div>}
                                {this.state.successMessage && <div style={{ color: 'green' }}>{this.state.successMessage}</div>}
                            </div>
                            <button type="submit" className="btn btn-primary">
                                Save
                            </button>
                        </form>
                    </div>
                </div>
                <div className="col-md-8">
                    <ul className="list-group">
                        {this.state.users.map(user => (
                            <li className="list-group-item list-group-item-action" key={user._id}>
                                {user.username}
                                <button onClick={() => this.openModal(user._id)} className="btn btn-danger btn-sm" style={{ float: 'right' }}>
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {this.state.isModalOpen && (
                    <div className="modal show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Confirm Deletion</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.closeModal}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <p>Are you sure you want to delete this user?</p>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={this.closeModal}>Cancel</button>
                                    <button type="button" className="btn btn-danger" onClick={this.deleteUser}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
