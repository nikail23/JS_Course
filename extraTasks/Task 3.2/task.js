let prices1 = [7,1,5,3,6,4];
let prices2 = [1,2,3,4,5];
let prices3 = [7,6,4,3,1];

function maxProfit(prices, start, end)
{
    if (end <= start)
        return 0;
    let profit = 0;
    for (let i = start; i < end; i++) {
        for (let j = i + 1; j <= end; j++) {
            if (prices[j] > prices[i]) {
                let curr_profit = prices[j] - prices[i] + maxProfit(prices, start, i - 1) + maxProfit(prices, j + 1, end);
                profit = Math.max(profit, curr_profit);
            }
        }
    }
    return profit;
}

console.log(maxProfit(prices1, 0, 5));
console.log(maxProfit(prices2, 0, 4));
console.log(maxProfit(prices3, 0, 4));