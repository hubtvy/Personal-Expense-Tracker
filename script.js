$(document).ready(function() {
  const expenseForm = $('#expense-form');
  const expenseList = $('#expense-list');
  const totalExpense = $('#total-expense');
  const ctx = $('#expense-chart')[0].getContext('2d');

  let chart; // Variable to hold the chart instance

  // Load expenses from Local Storage
  const expenses = JSON.parse(localStorage.getItem('expenses')) || [];

  // Function to update total expense
  function updateTotal() {
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    totalExpense.text(`RM ${total.toFixed(2)}`);
  }

  // Function to render expenses
  function renderExpenses() {
    expenseList.empty();
    expenses.forEach((expense, index) => {
      let categoryClass = '';
      switch (expense.category) {
        default:
          categoryClass = expense.category;
      }

      const expenseItem = `<tr>
        <td class="description-cell">${expense.description}</td>
        <td><span class="category-cell ${categoryClass}">${expense.category}</span></td>
        <td>RM ${parseFloat(expense.amount).toFixed(2)}</td>
        <td>${expense.date}</td>
        <td data-index="${index}">
          <button class="btn btn-danger btn-sm delete-expense">Delete</button>
          <button class="btn btn-warning btn-sm edit-expense">Edit</button>
        </td>
      </tr>`;
      expenseList.append(expenseItem);
    });
    updateTotal();
    renderChart();
  }

  // Function to render chart
  function renderChart() {
    const monthlyExpenses = {};

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;

      if (!monthlyExpenses[monthYear]) {
        monthlyExpenses[monthYear] = 0;
      }
      monthlyExpenses[monthYear] += parseFloat(expense.amount);
    });

    const labels = Object.keys(monthlyExpenses);
    const data = Object.values(monthlyExpenses);

    if (chart) {
      chart.destroy(); // Destroy existing chart before creating a new one
    }

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total Expenses (RM)',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          x: {
            grid: {
              display: false  // Hide vertical grid lines
            }
          },
          y: {
            grid: {
              display: false,  // Hide horizontal grid lines
              beginAtZero: true
            }
          }
        }
      }
    });
  }

  renderExpenses();

  // Add or Edit Expense
  expenseForm.on('submit', function(event) {
    event.preventDefault();
    const amount = $('#expense-amount').val();
    const date = $('#expense-date').val();
    const description = $('#expense-description').val();
    const category = $('#expense-category').val();
    const index = $('#expense-index').val();

    if (index) {
      // Edit existing expense
      expenses[index] = { amount, date, description, category };
      $('#expense-index').val('');
      expenseForm.find('button[type="submit"]').text('Add Expense');
    } else {
      // Add new expense
      expenses.push({ amount, date, description, category });
    }

    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    this.reset();
  });

  // Delete Expense
  expenseList.on('click', '.delete-expense', function() {
    const index = $(this).closest('td').data('index');
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
  });

  // Edit Expense
  expenseList.on('click', '.edit-expense', function() {
    const index = $(this).closest('td').data('index');
    const expense = expenses[index];
    $('#expense-amount').val(expense.amount);
    $('#expense-date').val(expense.date);
    $('#expense-description').val(expense.description);
    $('#expense-category').val(expense.category);
    $('#expense-index').val(index);
    expenseForm.find('button[type="submit"]').text('Edit Expense');
  });
});
