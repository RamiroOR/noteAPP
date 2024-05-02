import React, { Component } from 'react';
import axios from 'axios';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';

export default class NotesList extends Component {
    state = {
        notes: [],
        isLoading: true,
        error: null,
        modalOpen: false,
        noteToDelete: null
    }

    componentDidMount() {
        this.getNotes()
    }

    async getNotes() {
        try {
            const res = await axios.get('http://localhost:4000/api/notes')
            this.setState({ notes: res.data, isLoading: false })
        } catch (error) {
            this.setState({ error: 'Failed to load notes', isLoading: false })
        }
    }

    openDeleteModal = (noteId) => {
        this.setState({ modalOpen: true, noteToDelete: noteId });
    }

    closeModal = () => {
        this.setState({ modalOpen: false, noteToDelete: null });
    }

    deleteNote = async () => {
        const { noteToDelete } = this.state;
        try {
            await axios.delete(`http://localhost:4000/api/notes/${noteToDelete}`);
            this.getNotes();
        } catch (error) {
            console.error('Failed to delete the note');
        }
        this.closeModal();
    }

    render() {
        const { isLoading, error, notes, modalOpen } = this.state;

        if (isLoading) {
            return <p>Loading notes...</p>
        }

        if (error) {
            return <p>{error}</p>
        }

        return (
            <div>
                <div className="row">
                    {notes.map(note => (
                        <div className="col-md-4 p-2" key={note._id}>
                            <div className="card">
                                <div className="card-header d-flex justify-content-between">
                                    <h5>{note.title}</h5>
                                    <Link className="btn btn-secondary" to={`/edit/${note._id}`}>
                                        Edit
                                    </Link>
                                </div>
                                <div className="card-body">
                                    <p>{note.content}</p>
                                    <p>{note.author}</p>
                                    <p>{format(note.date)}</p>
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => this.openDeleteModal(note._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <ConfirmationModal
                    isOpen={modalOpen}
                    title="Delete Note"
                    body="Are you sure you want to delete this note?"
                    onConfirm={this.deleteNote}
                    onCancel={this.closeModal}
                />
            </div>
        )
    }
}
