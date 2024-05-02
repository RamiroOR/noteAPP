import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function CreateNote() {
    const [users, setUsers] = useState([]);
    const [userSelected, setUserSelected] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [date, setDate] = useState(new Date());
    const [isEditing, setIsEditing] = useState(false);
    const [noteId, setNoteId] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:4000/api/users');
                if (res.data.length > 0) {
                    setUsers(res.data);
                    setUserSelected(res.data[0].username);
                } else {
                    setAlert({ show: true, message: 'No users available. Please create a user first.', type: 'danger' });
                    setUserSelected(''); // Ensure no user is selected if none are available
                }

                if (id && res.data.length > 0) {
                    const noteRes = await axios.get(`http://localhost:4000/api/notes/${id}`);
                    setTitle(noteRes.data.title);
                    setContent(noteRes.data.content);
                    setDate(new Date(noteRes.data.date));
                    setUserSelected(noteRes.data.author);
                    setIsEditing(true);
                    setNoteId(id);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                setAlert({ show: true, message: 'Failed to load data!', type: 'danger' });
            }
        };

        fetchData();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setAlert({ show: true, message: 'Please fill in all fields.', type: 'danger' });
            return;
        }

        const newNote = {
            title,
            content,
            date,
            author: userSelected
        };

        try {
            if (isEditing) {
                await axios.put(`http://localhost:4000/api/notes/${noteId}`, newNote);
            } else {
                await axios.post('http://localhost:4000/api/notes', newNote);
            }
            setAlert({ show: true, message: 'Note saved successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/');
            }, 2000); // Redirect after 2 seconds
        } catch (error) {
            console.error("Failed to save the note", error);
            setAlert({ show: true, message: 'Failed to save the note!', type: 'danger' });
        }
    };

    return (
        <div className="col-md-6 offset-md-3">
            <div className="card card-body">
                <h4>{isEditing ? 'Edit Note' : 'Create Note'}</h4>
                {alert.show && (
                    <div className={`alert alert-${alert.type}`} role="alert">
                        {alert.message}
                    </div>
                )}
                {users.length > 0 ? (
                  <>
                    <div className="form-group">
                        <select 
                            className="form-control"
                            onChange={e => setUserSelected(e.target.value)}
                            value={userSelected}
                        >
                            {users.map(user => 
                                <option key={user._id} value={user.username}>
                                    {user.username}
                                </option>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Title" 
                            onChange={e => setTitle(e.target.value)}
                            required
                            value={title} 
                        />
                    </div>
                    <div className="form-group">
                        <textarea 
                            className="form-control"
                            placeholder="Content"
                            onChange={e => setContent(e.target.value)}
                            required
                            value={content}
                        />
                    </div>
                    <div className="form-group">
                        <DatePicker 
                            className="form-control" 
                            selected={date}
                            onChange={setDate}
                        />
                    </div>

                    <button onClick={onSubmit} className="btn btn-primary" disabled={!userSelected}>
                        Save
                    </button>
                  </>
                ) : (
                  <div className="alert alert-warning" role="alert">
                    No users available to assign the note. Please create a user first.
                  </div>
                )}
            </div>
        </div>
    );
}
