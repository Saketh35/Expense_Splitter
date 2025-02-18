from flask import Flask, render_template, request, jsonify
from collections import defaultdict

app = Flask(__name__)

def settle_expenses(expenses):
    balances = defaultdict(float)

    for expense in expenses:
        payer = expense["payer"]
        amount_paid = expense["amount_paid"]
        shares = expense["shares"]

        balances[payer] += amount_paid
        for person, amount in shares.items():
            balances[person] -= amount

    creditors = sorted([(person, balance) for person, balance in balances.items() if balance > 0], key=lambda x: -x[1])
    debtors = sorted([(person, balance) for person, balance in balances.items() if balance < 0], key=lambda x: x[1])

    transactions = []
    i, j = 0, 0
    while i < len(debtors) and j < len(creditors):
        debtor, debt_amount = debtors[i]
        creditor, credit_amount = creditors[j]

        amount_to_pay = min(-debt_amount, credit_amount)

        transactions.append((debtor, creditor, amount_to_pay))

        debtors[i] = (debtor, debt_amount + amount_to_pay)
        creditors[j] = (creditor, credit_amount - amount_to_pay)

        if debtors[i][1] == 0:
            i += 1
        if creditors[j][1] == 0:
            j += 1

    return transactions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    expenses = data.get('expenses', [])
    settlements = settle_expenses(expenses)
    return jsonify({"settlements": settlements})

if __name__ == '__main__':
    app.run(debug=True)
