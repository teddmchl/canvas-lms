require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/canvas_lms";

/* ── Inline schemas (avoid ESM issues in seed script) ── */
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, enum: ["student", "instructor"], default: "student" },
  bio: String,
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  title: String, description: String, instructor: mongoose.Schema.Types.ObjectId,
  subject: String, level: String, coverColor: String, published: Boolean, modules: Array,
}, { timestamps: true });

const assignmentSchema = new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId, title: String, description: String,
  dueDate: Date, maxPoints: Number, order: Number,
}, { timestamps: true });

const enrollmentSchema = new mongoose.Schema({
  course: mongoose.Schema.Types.ObjectId, student: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const submissionSchema = new mongoose.Schema({
  assignment: mongoose.Schema.Types.ObjectId, course: mongoose.Schema.Types.ObjectId,
  student: mongoose.Schema.Types.ObjectId, content: String,
  grade: Number, feedback: String, gradedAt: Date, gradedBy: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: "submitted" },
}, { timestamps: true });

const User       = mongoose.models.User       || mongoose.model("User",       userSchema);
const Course     = mongoose.models.Course     || mongoose.model("Course",     courseSchema);
const Assignment = mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing
  await Promise.all([
    User.deleteMany({}), Course.deleteMany({}), Assignment.deleteMany({}),
    Enrollment.deleteMany({}), Submission.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  const hash = (p) => bcrypt.hash(p, 12);

  /* ── Users ── */
  const [inst1, inst2, st1, st2] = await Promise.all([
    User.create({ name: "Dr. Amara Osei", email: "instructor@demo.com", password: await hash("demo1234"), role: "instructor", bio: "PhD in Computer Science. 10 years teaching experience." }),
    User.create({ name: "Prof. Lena Fischer", email: "lena@demo.com", password: await hash("demo1234"), role: "instructor", bio: "Mathematics educator with a passion for data science." }),
    User.create({ name: "Kofi Mensah", email: "student@demo.com", password: await hash("demo1234"), role: "student" }),
    User.create({ name: "Priya Nair", email: "priya@demo.com", password: await hash("demo1234"), role: "student" }),
  ]);
  console.log("Created 4 users");

  /* ── Courses ── */
  const [c1, c2, c3] = await Promise.all([
    Course.create({
      title: "Introduction to Python Programming",
      description: "A comprehensive introduction to Python — one of the most versatile and beginner-friendly languages in the world. You'll start from the basics and build your way to writing real programs.",
      instructor: inst1._id, subject: "Programming", level: "Beginner", coverColor: "#1d4ed8", published: true,
      modules: [
        { title: "Getting Started", description: "Installing Python, using the REPL, your first script", order: 0 },
        { title: "Variables & Data Types", description: "Numbers, strings, booleans, lists, and dictionaries", order: 1 },
        { title: "Control Flow", description: "If statements, for loops, while loops, and functions", order: 2 },
        { title: "Working with Files", description: "Reading and writing text files, CSV parsing", order: 3 },
      ],
    }),
    Course.create({
      title: "Data Structures & Algorithms",
      description: "Master the fundamental data structures and algorithms every software engineer needs to know. From arrays and linked lists to trees, graphs, sorting, and searching algorithms.",
      instructor: inst1._id, subject: "Computer Science", level: "Intermediate", coverColor: "#7c3aed", published: true,
      modules: [
        { title: "Arrays & Linked Lists", description: "Memory layout, pointer manipulation, and common operations", order: 0 },
        { title: "Stacks, Queues & Heaps", description: "LIFO, FIFO, and priority-based data structures", order: 1 },
        { title: "Trees & Graphs", description: "Binary trees, BSTs, DFS, BFS, and graph algorithms", order: 2 },
        { title: "Sorting Algorithms", description: "Bubble, merge, quick, heap sort — analysis and implementation", order: 3 },
      ],
    }),
    Course.create({
      title: "Statistics for Data Science",
      description: "Build a solid foundation in statistics with practical applications in data science. Cover probability, distributions, hypothesis testing, regression, and more.",
      instructor: inst2._id, subject: "Mathematics", level: "Intermediate", coverColor: "#059669", published: true,
      modules: [
        { title: "Descriptive Statistics", description: "Measures of central tendency and spread", order: 0 },
        { title: "Probability", description: "Probability rules, conditional probability, Bayes theorem", order: 1 },
        { title: "Distributions", description: "Normal, binomial, Poisson distributions", order: 2 },
      ],
    }),
  ]);
  console.log("Created 3 courses");

  /* ── Assignments ── */
  const future = (days) => new Date(Date.now() + days * 86400000);
  const past   = (days) => new Date(Date.now() - days * 86400000);

  const assignments = await Assignment.insertMany([
    // Python
    { course: c1._id, title: "Hello World & Basic Syntax",   description: "Write a Python script that prints your name, calculates the area of a circle given a radius, and converts Celsius to Fahrenheit. Submit the full .py file contents.", maxPoints: 50,  order: 0, dueDate: past(5) },
    { course: c1._id, title: "Lists and Loops",               description: "Write a program that takes a list of 10 numbers, computes the mean, median, and finds all numbers above average. Use only built-in Python — no libraries.", maxPoints: 100, order: 1, dueDate: future(3) },
    { course: c1._id, title: "Functions and File I/O",        description: "Build a simple address book CLI. Users can add contacts (name, phone, email) and the data must persist to a text file between runs.", maxPoints: 150, order: 2, dueDate: future(10) },
    // DSA
    { course: c2._id, title: "Implement a Linked List",       description: "Implement a singly linked list in Python with: append, prepend, delete, search, and reverse methods. Write tests for each method.", maxPoints: 100, order: 0, dueDate: past(2) },
    { course: c2._id, title: "Binary Search Tree",            description: "Implement a BST with insert, search, and in-order traversal. Then answer: what is the time complexity of each operation in the best and worst case?", maxPoints: 100, order: 1, dueDate: future(7) },
    // Stats
    { course: c3._id, title: "Descriptive Statistics Report", description: "Using the provided dataset (50 exam scores), calculate mean, median, mode, variance, and standard deviation. Present your work with brief explanations.", maxPoints: 80,  order: 0, dueDate: past(1) },
    { course: c3._id, title: "Probability Problems",          description: "Solve the 8 probability problems in the brief below, showing all working. Submit as a written report.", maxPoints: 100, order: 1, dueDate: future(5) },
  ]);
  console.log(`Created ${assignments.length} assignments`);

  /* ── Enrollments ── */
  await Enrollment.insertMany([
    { course: c1._id, student: st1._id },
    { course: c2._id, student: st1._id },
    { course: c1._id, student: st2._id },
    { course: c3._id, student: st2._id },
  ]);
  console.log("Created 4 enrollments");

  /* ── Submissions ── */
  const pyAssign1 = assignments[0]; // past due
  const pyAssign2 = assignments[1]; // upcoming
  const dsaAssign1 = assignments[3]; // past due
  const statsAssign1 = assignments[5]; // past due

  await Submission.insertMany([
    // Kofi — graded submission
    {
      assignment: pyAssign1._id, course: c1._id, student: st1._id,
      content: "# Hello World\nprint('Hello, my name is Kofi Mensah')\n\nimport math\nradius = 5\narea = math.pi * radius ** 2\nprint(f'Circle area: {area:.2f}')\n\ncelsius = 25\nfahrenheit = (celsius * 9/5) + 32\nprint(f'{celsius}°C = {fahrenheit}°F')",
      status: "graded", grade: 46, feedback: "Good work overall! The circle area calculation is correct. For future assignments, try to add input validation so the program handles invalid inputs gracefully.", gradedAt: new Date(), gradedBy: inst1._id,
    },
    // Kofi — pending submission
    {
      assignment: pyAssign2._id, course: c1._id, student: st1._id,
      content: "numbers = [4, 7, 13, 2, 8, 15, 3, 11, 6, 9]\n\nmean = sum(numbers) / len(numbers)\nprint(f'Mean: {mean}')\n\nsorted_nums = sorted(numbers)\nn = len(sorted_nums)\nif n % 2 == 0:\n    median = (sorted_nums[n//2 - 1] + sorted_nums[n//2]) / 2\nelse:\n    median = sorted_nums[n//2]\nprint(f'Median: {median}')\n\nabove_avg = [x for x in numbers if x > mean]\nprint(f'Above average: {above_avg}')",
      status: "submitted",
    },
    // Priya — graded submission on Python
    {
      assignment: pyAssign1._id, course: c1._id, student: st2._id,
      content: "print('Hello, I am Priya Nair')\n\npi = 3.14159\nradius = float(input('Enter radius: '))\narea = pi * radius * radius\nprint(f'Area: {area:.4f}')\n\nc = float(input('Celsius: '))\nf = (c * 9/5) + 32\nprint(f'Fahrenheit: {f}')",
      status: "graded", grade: 48, feedback: "Excellent! You added input() which shows initiative. Minor note: use math.pi instead of approximating — it's more precise.", gradedAt: new Date(), gradedBy: inst1._id,
    },
    // Kofi — DSA submission (pending grade)
    {
      assignment: dsaAssign1._id, course: c2._id, student: st1._id,
      content: "class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n\n    def append(self, data):\n        new_node = Node(data)\n        if not self.head:\n            self.head = new_node\n            return\n        current = self.head\n        while current.next:\n            current = current.next\n        current.next = new_node\n\n    def prepend(self, data):\n        new_node = Node(data)\n        new_node.next = self.head\n        self.head = new_node\n\n    def delete(self, data):\n        if not self.head:\n            return\n        if self.head.data == data:\n            self.head = self.head.next\n            return\n        current = self.head\n        while current.next:\n            if current.next.data == data:\n                current.next = current.next.next\n                return\n            current = current.next\n\n    def search(self, data):\n        current = self.head\n        while current:\n            if current.data == data:\n                return True\n            current = current.next\n        return False\n\n    def reverse(self):\n        prev = None\n        current = self.head\n        while current:\n            next_node = current.next\n            current.next = prev\n            prev = current\n            current = next_node\n        self.head = prev",
      status: "submitted",
    },
    // Priya — Stats submission (pending)
    {
      assignment: statsAssign1._id, course: c3._id, student: st2._id,
      content: "Dataset: 50 exam scores\n\nMean = (sum of all scores) / 50 = 3420 / 50 = 68.4\n\nMedian: Sorted the scores, with n=50 (even), median = (score[25] + score[26]) / 2 = (67 + 69) / 2 = 68.0\n\nMode: 72 appeared 4 times — the most frequent value.\n\nVariance: Sum of (x - mean)^2 / n = 347.24\n\nStandard Deviation: sqrt(347.24) = 18.61\n\nInterpretation: The class performed around a C+/B- average. The standard deviation of 18.61 indicates a wide spread — roughly 68% of students scored between 49.8 and 87.0.",
      status: "submitted",
    },
  ]);
  console.log("Created 5 submissions");

  console.log("\n✅ Seed complete!\n");
  console.log("Demo accounts:");
  console.log("  Instructor: instructor@demo.com / demo1234");
  console.log("  Student:    student@demo.com / demo1234");
  console.log("  Student 2:  priya@demo.com / demo1234\n");

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
