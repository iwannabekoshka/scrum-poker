import React from 'react';

const HowToExportYoutrackTasks = () => (
  <div className="document-content">
    <h1>Как экспортировать задачи из YouTrack</h1>
    
    <ol>
      <li>Перейти на страницу поиска задач - <a href="https://pvs-studio.myjetbrains.com/youtrack/issues" target='_blank'>Issues</a></li>
      <li>В строке поиска ввести запрос, например список задач в ноябре 2025 с компонентом Web - <code>#Web Due Date: 2025-11-01 .. 2025-11-30</code></li>
      <li>Выбрать все задачи с помощью чекбокса над списком задач "Select all", либо только нужные через чекбоксы слева от id задач.</li>
      <li>В нижней панели нажать кнопку "Export data", выбрать "Export in CSV".</li>
    </ol>
  </div>
);

export default HowToExportYoutrackTasks;

