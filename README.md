# 🚀 AI Tool Preference Analytics Dashboard

## 📊 Real-Time Streaming + Probabilistic Analytics

A real-time analytics dashboard that tracks trending AI tools using **stream processing** and **memory-efficient algorithms**.

This project simulates how modern systems analyze massive, continuous data streams using the **Count-Min Sketch (CMS)** algorithm to identify **Top-K trending AI tools** with minimal memory.

---

## 🔥 Key Highlights

* ⚡ Real-time stream processing (Hacker News + synthetic events)
* 🧠 Count-Min Sketch for approximate frequency estimation
* 🏆 Top-K ranking of trending AI tools
* 📈 Trend detection alerts (rank jumps & new entries)
* 🌍 Region-based analytics + industry distribution
* 📉 Interactive charts using modern frontend tools

---

## 🏗️ System Architecture

![Image](https://images.openai.com/static-rsc-4/SG_APNKbGYmliYY7FBAq3mIar5AhXCA5i8rL-FSAEdDSYXP0T8E3Xbyw4HPFF4ONO0wvPwEs5hf4zuAS3Gz-hwrnIng60N7MwP78IqOYy9ALyg3Xct4DBWvlSJ23_R_IzpjSzZmchDc92t-UWGhiVj0EFIt9EF_iviXwCy1M1og0kDit3fm172zZRQ9Ki5PV?purpose=fullsize)


### 🔄 Data Flow

#### 1. Stream Ingestion

* Fetches live data from Hacker News
* Injects synthetic AI-related events

#### 2. Frequency Estimation

* Uses Count-Min Sketch (CMS)
* Updates counters using hash functions

#### 3. Top-K Tracking

* Maintains ranking using a Min-Heap

#### 4. Trend Detection

* Detects rank changes & new entries

#### 5. Visualization

* Displays insights via charts & dashboards

---

## 🧠 Core Technology: Count-Min Sketch

A probabilistic data structure that:

* Uses fixed memory
* Processes infinite streams
* Provides fast approximate counts

---

## 📌 Why CMS?

| Problem               | Solution               |
| --------------------- | ---------------------- |
| Infinite data stream  | Constant memory usage  |
| Exact counting costly | Approximate estimation |
| Real-time requirement | O(1) updates           |

---

## ⚙️ Features

### 📡 Streaming Engine

* Live ingestion from Hacker News API
* Continuous synthetic event generation

### 🏆 Top-K Analytics

* Tracks most popular AI tools
* Uses approximate frequency counting

### 🚨 Trend Alerts

Detects:

* Rank increase 📈
* New trending tools 🆕

### 🌍 Insights

* Region-wise usage heatmap
* Industry distribution

### 📊 Dashboard UI

Built with:

* React + Vite
* Recharts
* Lucide React

---

## 📐 Algorithm Details

### Count-Min Sketch

* Matrix of **Depth × Width**
* Multiple hash functions
* Uses **minimum value** for estimation

### ⏱ Complexity

| Operation | Complexity |
| --------- | ---------- |
| Update    | O(d)       |
| Query     | O(d)       |
| Top-K     | O(log K)   |

---

## 🛠️ Tech Stack

### Frontend

* React + Vite
* Recharts
* Tailwind CSS (if used)
* Lucide React Icons

### Backend / Logic

* TypeScript
* Custom Count-Min Sketch implementation
* Stream simulation engine

---

## 📈 Real-World Applications

* 📱 Trending tools detection
* 🌐 Social media analytics
* 💳 Fraud detection systems
* 📊 Real-time dashboards
* 🛒 Recommendation systems

---

## ⚠️ Notes

* No API keys required
* Uses public Hacker News API
* Includes synthetic data for continuous simulation
* Built for learning and prototyping (not production)

---

## 💡 Key Learnings

* Efficient stream processing design
* Accuracy vs memory trade-off
* Probabilistic algorithms in practice
* Real-time data visualization

---

## 👨‍💻 Author

Sarathy P
