import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

const YOU_TRACK_BASE_URL = 'https://pvs-studio.myjetbrains.com/youtrack/issue/';
const CSV_FORMAT_ERROR = 'Данный .csv файл не соответствует формату';

const TaskSidebar = ({
  tasks,
  currentTask,
  onAddTask,
  onDeleteTask,
  onSelectTask,
  onUpdateTaskTime,
  onImportTasks
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTime, setEditedTime] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

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

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportButtonClick = () => {
    setImportError('');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!onImportTasks) {
      setImportError('Импорт задач временно недоступен');
      resetFileInput();
      return;
    }

    setIsImporting(true);
    setImportError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const fields = results?.meta?.fields || [];
          const hasRequiredFields =
            fields.includes('Summary') && fields.includes('Issue Id');

          if (!hasRequiredFields) {
            setImportError(CSV_FORMAT_ERROR);
            return;
          }

          const importedTasks = (results?.data || [])
            .map((row, index) => {
              if (!row) {
                return null;
              }

              const summary = typeof row['Summary'] === 'string'
                ? row['Summary'].trim()
                : '';
              const issueId = typeof row['Issue Id'] === 'string'
                ? row['Issue Id'].trim()
                : '';

              if (!summary) {
                return null;
              }

              const youtrackUrl = issueId
                ? `${YOU_TRACK_BASE_URL}${issueId}`
                : '';

              return {
                id: issueId || `youtrack-${Date.now()}-${index}`,
                title: `${issueId}: ${summary}`,
                youtrackUrl
              };
            })
            .filter(Boolean);

          if (importedTasks.length === 0) {
            setImportError(CSV_FORMAT_ERROR);
            return;
          }

          onImportTasks(importedTasks);
          setImportError('');
        } catch (error) {
          console.error('Failed to import CSV', error);
          setImportError(CSV_FORMAT_ERROR);
        } finally {
          setIsImporting(false);
          resetFileInput();
        }
      },
      error: (error) => {
        console.error('CSV parsing error', error);
        setImportError(CSV_FORMAT_ERROR);
        setIsImporting(false);
        resetFileInput();
      }
    });
  };

  const handleOpenHowTo = () => {
    window.open(
      '/how-to-export-youtrack-tasks/',
      '_blank',
      'noopener,noreferrer'
    );
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

      <div className="task-import-section">
        <div className="task-import-controls">
          <button
            type="button"
            className="import-btn"
            onClick={handleImportButtonClick}
            disabled={isImporting}
          >
            {isImporting ? 'Импортируем...' : 'Импортировать YouTrack .csv'}
          </button>
          <button
            type="button"
            className="import-info-btn"
            title="Как выгрузить задачи из YouTrack"
            onClick={handleOpenHowTo}
          >
            ℹ️
          </button>
        </div>
        {importError && (
          <div className="import-error">
            {importError}
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,text/csv"
          className="visually-hidden-input"
          onChange={handleImportFileChange}
        />
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