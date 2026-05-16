// # Task
// Provide 3 unique implementations of the following function in JavaScript.
// Input: 
//      - n any integer
//      - Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
// Output: return summation to n, i.e. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15.


// A. Using the mathematical formula. Use the formula n * (n + 1) / 2
// - Time Complexity: O(1)
// - Space Complexity: O(1)
var sum_to_n_a = function (n) {
    return (n * (n + 1)) / 2;
};

// B. Using a loop. Iterate from 1 to n and accumulate the sum
// - Time Complexity: O(n)
// - Space Complexity: O(1) 
var sum_to_n_b = function (n) {
    let sum = 0;

    for (let i = 1; i <= n; i++) {
        sum += i;
    }

    return sum;
};

// C. Using recursion. sum(n) = n + sum(n - 1)
// - Time Complexity: O(n)
// - Space Complexity: O(n) (because recursive calls consume call stack memory)
var sum_to_n_c = function (n) {
    if (n <= 1) {
        return n;
    }

    return n + sum_to_n_c(n - 1);
};

function runTests() {
    const implementations = [
        { name: "Formula", fn: sum_to_n_a },
        { name: "Loop", fn: sum_to_n_b },
        { name: "Recursion", fn: sum_to_n_c },
    ];

    const testCases = [
        {
            input: 1,
            expected: 1,
            description: "should return 1 for n = 1",
        },
        {
            input: 5,
            expected: 15,
            description: "should calculate sum from 1 to 5",
        },
        {
            input: 10,
            expected: 55,
            description: "should calculate sum from 1 to 10",
        },
        {
            input: 0,
            expected: 0,
            description: "should return 0 for n = 0",
        },
        {
            input: 100,
            expected: 5050,
            description: "should handle larger numbers correctly",
        },
    ];

    implementations.forEach(({ name, fn }) => {
        console.log(`\nTesting: ${name}`);

        testCases.forEach(({ input, expected, description }) => {
            const result = fn(input);

            assertEqual(result, expected, description);
        });
    });

    console.log("\n✅ All test cases passed!");

    function assertEqual(actual, expected, description) {
        if (actual !== expected) {
            throw new Error(
                `❌ ${description}\nExpected: ${expected}\nActual: ${actual}`
            );
        }

        console.log(`✓ ${description}`);
    }
}

runTests()