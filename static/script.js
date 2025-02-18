$(document).ready(function() {
    let expenseCount = 0;

    function addExpenseField() {
        expenseCount++;
        let html = `
            <div class="card p-3 mt-2" id="expense_${expenseCount}">
                <label>Payer:</label>
                <input type="text" class="form-control payer" placeholder="Enter name">
                <label>Amount Paid:</label>
                <input type="number" class="form-control amount_paid" placeholder="Total amount paid">
                <label>Shares:</label>
                <div class="shares">
                    <button type="button" class="btn btn-sm btn-secondary addShare">+ Add Share</button>
                </div>
                <button type="button" class="btn btn-danger btn-sm removeExpense mt-2">Remove</button>
            </div>
        `;
        $("#expenses").append(html);
    }

    $(document).on("click", "#addExpense", function() {
        addExpenseField();
    });

    $(document).on("click", ".removeExpense", function() {
        $(this).closest(".card").remove();
    });

    $(document).on("click", ".addShare", function() {
        let shareHtml = `
            <div class="input-group mt-1 share">
                <input type="text" class="form-control share_name" placeholder="Name">
                <input type="number" class="form-control share_amount" placeholder="Amount">
                <button type="button" class="btn btn-danger btn-sm removeShare">X</button>
            </div>
        `;
        $(this).parent().append(shareHtml);
    });

    $(document).on("click", ".removeShare", function() {
        $(this).closest(".share").remove();
    });

    $("#expenseForm").submit(function(event) {
        event.preventDefault();
        let expenses = [];

        $(".card").each(function() {
            let payer = $(this).find(".payer").val();
            let amount_paid = parseFloat($(this).find(".amount_paid").val()) || 0;
            let shares = {};

            $(this).find(".share").each(function() {
                let share_name = $(this).find(".share_name").val();
                let share_amount = parseFloat($(this).find(".share_amount").val()) || 0;
                if (share_name && share_amount) {
                    shares[share_name] = share_amount;
                }
            });

            if (payer && amount_paid) {
                expenses.push({ payer, amount_paid, shares });
            }
        });

        $.ajax({
            url: "/calculate",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ expenses }),
            success: function(response) {
                $("#settlements").empty();
                response.settlements.forEach(settlement => {
                    $("#settlements").append(`<li>${settlement[0]} pays ${settlement[1]} ₹${settlement[2]}</li>`);
                });
            }
        });
    });

    addExpenseField();  // Add first expense field on page load
});
