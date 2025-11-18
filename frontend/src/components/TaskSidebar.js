import React, { useState } from 'react';

const TaskSidebar = ({
  tasks,
  currentTask,
  onAddTask,
  onDeleteTask,
  onSelectTask,
  onUpdateTaskTime
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTime, setEditedTime] = useState('');

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask({
        title: newTaskTitle.trim(),
        youtrackUrl: newTaskUrl.trim()
      });
      setNewTaskTitle('');
      setNewTaskUrl('');
      setIsAdding(false);
    }
  };

  const handleDeleteTask = (taskId, e) => {
    e.stopPropagation();
    onDeleteTask(taskId);
  };

  const handleStartEditTime = (task, e) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditedTime(
      task.time !== null && task.time !== undefined ? task.time : ''
    );
  };

  const handleCancelEdit = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setEditingTaskId(null);
    setEditedTime('');
  };

  const handleSubmitTime = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onUpdateTaskTime) return;

    const normalizedTime =
      editedTime === '' ? null : Number(editedTime);

    onUpdateTaskTime(taskId, normalizedTime);
    setEditingTaskId(null);
    setEditedTime('');
  };

  const formatTime = (time) => {
    if (time === null || time === undefined || time === '') {
      return '—';
    }
    return Number(time).toFixed(2).replace(/\.?0+$/, '');
  };

  return (
    <div className="task-sidebar">
      <div className="sidebar-header">
        <h3>📋 Список задач</h3>
        <button 
          className="add-task-btn"
          onClick={() => setIsAdding(true)}
        >
          + Добавить
        </button>
      </div>

      {isAdding && (
        <div className="add-task-form">
          <form onSubmit={handleAddTask}>
            <input
              type="text"
              placeholder="Название задачи*"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
              required
            />
            <input
              type="url"
              placeholder="Ссылка на YouTrack"
              value={newTaskUrl}
              onChange={(e) => setNewTaskUrl(e.target.value)}
            />
            <div className="form-actions">
              <button type="submit">Добавить</button>
              <button type="button" onClick={() => setIsAdding(false)}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="no-tasks">
            Нет задач. Добавьте первую задачу!
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`task-item ${currentTask && currentTask.id === task.id ? 'active' : ''}`}
              onClick={() => onSelectTask(task.id)}
            >
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                {task.youtrackUrl && (
                  <div className="task-url">
                    <a 
                      href={task.youtrackUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      🔗 YouTrack
                    </a>
                  </div>
                )}
                <div className="task-time-row">
                  <span className="task-time-label">⏱ {formatTime(task.time)}</span>
                  {editingTaskId === task.id ? (
                    <form 
                      className="task-time-form"
                      onSubmit={(e) => handleSubmitTime(e, task.id)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                        placeholder="0"
                      />
                      <button type="submit">OK</button>
                      <button type="button" onClick={handleCancelEdit}>
                        ×
                      </button>
                    </form>
                  ) : (
                    <button
                      className="edit-time-btn"
                      onClick={(e) => handleStartEditTime(task, e)}
                      title="Изменить время"
                    >
                      Изм.
                    </button>
                  )}
                </div>
              </div>
              <button
                className="delete-task-btn"
                onClick={(e) => handleDeleteTask(task.id, e)}
                title="Удалить задачу"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskSidebar;