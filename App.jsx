import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const starterBooks = [
  { id: 1, title: "Things Fall Apart", author: "Chinua Achebe", genre: "Fiction", isbn: "9780385474542", quantity: 4 },
  { id: 2, title: "The River Between", author: "Ngũgĩ wa Thiong'o", genre: "Fiction", isbn: "9780435905484", quantity: 1 },
  { id: 3, title: "Introduction to Computing", author: "Peter Norton", genre: "Technology", isbn: "9780072978901", quantity: 3 }
];
const starterUsers = [
  { id: 1, name: "Library Admin", membershipId: "ADMIN001", role: "Admin" },
  { id: 2, name: "Mpho ", membershipId: "MEM001", role: "Member" }
];
function useSavedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
function Layout({ children, currentUser, onLogout }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-mark">📚</div>
      <h2>Community<br />Library</h2>
      <p className="side-caption">MANAGEMENT SYSTEM</p>
      <nav>
        <NavLink to="/" end>▦ <span>Dashboard</span></NavLink>
        <NavLink to="/books">▤ <span>Books</span></NavLink>
        <NavLink to="/transactions">↔ <span>Transactions</span></NavLink>
        <NavLink to="/users">♙ <span>Users</span></NavLink>
      </nav>
      <div className="side-bottom">
        <div className="user-mini"><div className="avatar">{(currentUser?.name || "L").charAt(0).toUpperCase()}</div><div><strong>{currentUser?.name || "Librarian"}</strong><small>{currentUser?.role || "Staff"}</small></div></div>
        <button className="logout-button" onClick={onLogout}>Log out</button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">LIBRARY WORKSPACE</span><h1>Good day, {currentUser?.name?.split(" ")[0] || "Librarian"} 👋</h1></div><span className="status-pill"><span className="status-dot"></span> System ready</span></header>
      {children}
      <footer>Community Library Management System <span>•</span> Data is saved in this browser</footer>
    </main>
  </div>;
}
function Login({ onLogin, users }) {
  const [name, setName] = useState("");
  const [membershipId, setMembershipId] = useState("");
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    const found = users.find(u => u.name.toLowerCase() === name.trim().toLowerCase() && u.membershipId.toLowerCase() === membershipId.trim().toLowerCase());
    if (!found) { setError("User not found. Use a name and membership ID listed in User Management."); return; }
    onLogin(found);
  }
  return <div className="login-page"><div className="login-card"><div className="brand-mark">📚</div><span className="eyebrow">WELCOME BACK</span><h1>Community Library</h1><p>Sign in to manage books, members and stock.</p><form onSubmit={submit} className="form-stack"><label>Full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" /></label><label>Membership ID<input required value={membershipId} onChange={e=>setMembershipId(e.target.value)} placeholder="e.g. ADMIN001" /></label>{error && <p className="error-message">{error}</p>}<button className="primary-button full-width">Sign in</button></form><small className="login-hint">Demo access: Library Admin / ADMIN001</small></div></div>;
}
function Dashboard({ books, users, transactions }) {
  const totalCopies = books.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
  const lowStock = books.filter(b => Number(b.quantity) < 2);
  return <section className="page-content">
    <div className="welcome-banner"><div><span className="eyebrow light">YOUR LIBRARY AT A GLANCE</span><h2>Everything in one place.</h2><p>Track your collection, manage stock and support your community of readers.</p></div><div className="banner-icon">📖</div></div>
    <div className="stats-grid">
      <Stat title="Different books" value={books.length} icon="▤" tone="purple" note="Titles in collection" />
      <Stat title="Total copies" value={totalCopies} icon="▣" tone="blue" note="Available in stock" />
      <Stat title="Registered users" value={users.length} icon="♙" tone="green" note="Library accounts" />
      <Stat title="Transactions" value={transactions.length} icon="↔" tone="orange" note="Recorded activities" />
    </div>
    <div className="content-card">
      <div className="section-heading"><div><h2>Current book availability</h2><p>Books with fewer than 2 copies are highlighted.</p></div><Link className="text-link" to="/books">Manage books →</Link></div>
      {books.length === 0 ? <Empty text="No books have been added yet. Visit Books to add your first title." /> : <div className="table-wrap"><table><thead><tr><th>Book title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Copies available</th><th>Status</th></tr></thead><tbody>{books.map(b=><tr key={b.id} className={Number(b.quantity)<2?"low-row":""}><td className="book-title">{b.title}</td><td>{b.author}</td><td><span className="genre-tag">{b.genre}</span></td><td>{b.isbn}</td><td><strong>{b.quantity}</strong></td><td><span className={Number(b.quantity)<2?"stock-badge low":"stock-badge"}>{Number(b.quantity)<2?"Low stock":"In stock"}</span></td></tr>)}</tbody></table></div>}
    </div>
    <div className="content-card"><div className="section-heading"><div><h2>Needs attention</h2><p>Keep an eye on books that are running low.</p></div><span className="count-bubble">{lowStock.length}</span></div>{lowStock.length ? <div className="low-list">{lowStock.map(b=><div className="low-item" key={b.id}><div className="book-mini-icon">📕</div><div className="grow"><strong>{b.title}</strong><small>{b.author}</small></div><span className="stock-badge low">{b.quantity} {b.quantity===1?"copy":"copies"} left</span></div>)}</div> : <Empty text="All books have at least 2 copies in stock." />}</div>
  </section>;
}
function Stat({ title, value, icon, tone, note }) { return <div className="stat-card"><div className={"stat-icon "+tone}>{icon}</div><span className="stat-title">{title}</span><strong className="stat-value">{value}</strong><small>{note}</small></div>; }
function Empty({ text }) { return <div className="empty-state"><span>✦</span><p>{text}</p></div>; }
function Books({ books, setBooks }) {
  const blank = { title:"", author:"", genre:"", isbn:"", quantity:"" };
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const filtered = books.filter(b => [b.title,b.author,b.genre,b.isbn].some(v=>String(v).toLowerCase().includes(search.toLowerCase())));
  function submit(e) {
    e.preventDefault(); setError("");
    const quantity = Number(form.quantity);
    if (!form.title.trim() || !form.author.trim() || !form.genre.trim() || !form.isbn.trim() || form.quantity === "") { setError("Please complete every field."); return; }
    if (!Number.isInteger(quantity) || quantity < 0) { setError("Quantity must be a whole number of zero or more."); return; }
    const duplicate = books.some(b => b.isbn.trim().toLowerCase() === form.isbn.trim().toLowerCase() && b.id !== editingId);
    if (duplicate) { setError("A book with this ISBN already exists."); return; }
    if (editingId) setBooks(prev=>prev.map(b=>b.id===editingId?{...b,...form,quantity}:b));
    else setBooks(prev=>[...prev,{...form,id:Date.now(),quantity}]);
    setForm(blank); setEditingId(null);
  }
  function edit(book) { setEditingId(book.id); setForm({title:book.title,author:book.author,genre:book.genre,isbn:book.isbn,quantity:String(book.quantity)}); window.scrollTo({top:0,behavior:"smooth"}); }
  function remove(book) { if (window.confirm(`Delete "${book.title}"?`)) setBooks(prev=>prev.filter(b=>b.id!==book.id)); }
  return <section className="page-content">
    <PageTitle eyebrow="COLLECTION" title="Book management" description="Add, update, search and remove books in your collection." />
    <div className="content-card"><div className="section-heading"><div><h2>{editingId?"Update book details":"Add a new book"}</h2><p>Enter the book information below.</p></div>{editingId&&<button className="secondary-button" onClick={()=>{setEditingId(null);setForm(blank);setError("");}}>Cancel edit</button>}</div>
      <form className="form-grid" onSubmit={submit}>
        <label>Book title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Things Fall Apart" /></label>
        <label>Author<input required value={form.author} onChange={e=>setForm({...form,author:e.target.value})} placeholder="Author name" /></label>
        <label>Genre<input required value={form.genre} onChange={e=>setForm({...form,genre:e.target.value})} placeholder="e.g. Fiction" /></label>
        <label>ISBN<input required value={form.isbn} onChange={e=>setForm({...form,isbn:e.target.value})} placeholder="ISBN number" /></label>
        <label>Initial quantity<input required type="number" min="0" step="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="0" /></label>
        <div className="form-action"><button className="primary-button">{editingId?"Save changes":"+ Add book"}</button></div>
        {error&&<p className="error-message full-row">{error}</p>}
      </form>
    </div>
    <div className="content-card"><div className="section-heading"><div><h2>Book collection <span className="count-bubble">{books.length}</span></h2><p>Update details or remove a book from the library.</p></div><input className="search-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books..." /></div>
      {filtered.length===0?<Empty text="No matching books found."/>:<div className="table-wrap"><table><thead><tr><th>Title / ISBN</th><th>Author</th><th>Genre</th><th>Quantity</th><th>Actions</th></tr></thead><tbody>{filtered.map(b=><tr key={b.id}><td><strong className="book-title">{b.title}</strong><small className="table-subtext">{b.isbn}</small></td><td>{b.author}</td><td><span className="genre-tag">{b.genre}</span></td><td><span className={Number(b.quantity)<2?"stock-badge low":"stock-badge"}>{b.quantity}</span></td><td><div className="action-group"><button className="small-button" onClick={()=>edit(b)}>Update</button><button className="small-button danger" onClick={()=>remove(b)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>
  </section>;
}
function PageTitle({eyebrow,title,description}) { return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{description}</p></div>; }
function Transactions({ books, setBooks, transactions, setTransactions, users }) {
  const [bookId,setBookId] = useState(""); const [type,setType] = useState("Borrow"); const [quantity,setQuantity] = useState("1"); const [member,setMember] = useState(""); const [note,setNote] = useState(""); const [error,setError] = useState("");
  function submit(e) {
    e.preventDefault(); setError("");
    const book=books.find(b=>b.id===Number(bookId)); const qty=Number(quantity);
    if(!book){setError("Please choose a book.");return;}
    if(!Number.isInteger(qty)||qty<1){setError("Quantity must be a whole number greater than zero.");return;}
    if(type==="Borrow"&&qty>book.quantity){setError(`Only ${book.quantity} copies are currently available.`);return;}
    if(type==="Borrow"&&!member.trim()){setError("Enter the borrowing member's name or membership ID.");return;}
    const updated=type==="Borrow"?book.quantity-qty:book.quantity+qty;
    setBooks(prev=>prev.map(b=>b.id===book.id?{...b,quantity:updated}:b));
    setTransactions(prev=>[{id:Date.now(),date:new Date().toLocaleString(),bookTitle:book.title,type,quantity:qty,member:member.trim()||"Stock replenishment",note:note.trim()},...prev]);
    setBookId("");setQuantity("1");setMember("");setNote("");
  }
  return <section className="page-content"><PageTitle eyebrow="STOCK CONTROL" title="Transactions" description="Record incoming stock and borrowed books, with a complete activity history."/>
    <div className="content-card"><div className="section-heading"><div><h2>Record a transaction</h2><p>Stock changes are automatically reflected in book availability.</p></div></div>
      {books.length===0?<Empty text="Add a book before recording transactions."/>:<form className="form-grid" onSubmit={submit}>
        <label>Transaction type<select value={type} onChange={e=>setType(e.target.value)}><option>Borrow</option><option>Add stock</option></select></label>
        <label>Book<select required value={bookId} onChange={e=>setBookId(e.target.value)}><option value="">Select a book</option>{books.map(b=><option key={b.id} value={b.id}>{b.title} — {b.quantity} available</option>)}</select></label>
        <label>Quantity<input type="number" min="1" step="1" required value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
        <label>{type==="Borrow"?"Borrower name / membership ID":"Received from (optional)"}<input value={member} onChange={e=>setMember(e.target.value)} placeholder={type==="Borrow"?"Member name or ID":"Supplier or donation source"}/></label>
        <label className="full-row">Notes (optional)<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a short note"/></label>
        {error&&<p className="error-message full-row">{error}</p>}<div className="form-action"><button className="primary-button">Save transaction</button></div>
      </form>}
    </div>
    <div className="content-card"><div className="section-heading"><div><h2>Transaction history</h2><p>Latest transactions appear first.</p></div><span className="count-bubble">{transactions.length}</span></div>
      {!transactions.length?<Empty text="No transactions recorded yet."/>:<div className="table-wrap"><table><thead><tr><th>Date</th><th>Book</th><th>Activity</th><th>Quantity</th><th>Member / source</th><th>Notes</th></tr></thead><tbody>{transactions.map(t=><tr key={t.id}><td>{t.date}</td><td className="book-title">{t.bookTitle}</td><td><span className={t.type==="Borrow"?"activity-badge borrow":"activity-badge add"}>{t.type}</span></td><td>{t.quantity}</td><td>{t.member}</td><td>{t.note||"—"}</td></tr>)}</tbody></table></div>}
    </div>
  </section>;
}
function Users({ users,setUsers }) {
  const blank={name:"",membershipId:"",role:"Member"}; const [form,setForm]=useState(blank); const [editingId,setEditingId]=useState(null); const [error,setError]=useState("");
  function submit(e){e.preventDefault();setError("");if(!form.name.trim()||!form.membershipId.trim()){setError("Name and membership ID are required.");return;}if(users.some(u=>u.membershipId.toLowerCase()===form.membershipId.trim().toLowerCase()&&u.id!==editingId)){setError("That membership ID is already in use.");return;}if(editingId)setUsers(prev=>prev.map(u=>u.id===editingId?{...u,...form,name:form.name.trim(),membershipId:form.membershipId.trim()}:u));else setUsers(prev=>[...prev,{...form,id:Date.now(),name:form.name.trim(),membershipId:form.membershipId.trim()}]);setForm(blank);setEditingId(null);}
  function edit(u){setEditingId(u.id);setForm({name:u.name,membershipId:u.membershipId,role:u.role});}
  function remove(u){if(u.role==="Admin"&&users.filter(x=>x.role==="Admin").length===1){setError("At least one admin account must remain.");return;}if(window.confirm(`Delete ${u.name}?`))setUsers(prev=>prev.filter(x=>x.id!==u.id));}
  return <section className="page-content"><PageTitle eyebrow="PEOPLE" title="User management" description="Manage library members and staff accounts."/>
    <div className="content-card"><div className="section-heading"><div><h2>{editingId?"Update user":"Add a user"}</h2><p>Each user should have a unique membership ID.</p></div>{editingId&&<button className="secondary-button" onClick={()=>{setEditingId(null);setForm(blank);}}>Cancel edit</button>}</div>
      <form className="form-grid" onSubmit={submit}><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name"/></label><label>Membership ID<input required value={form.membershipId} onChange={e=>setForm({...form,membershipId:e.target.value})} placeholder="e.g. MEM002"/></label><label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Member</option><option>Librarian</option><option>Admin</option></select></label><div className="form-action"><button className="primary-button">{editingId?"Save changes":"+ Add user"}</button></div>{error&&<p className="error-message full-row">{error}</p>}</form>
    </div>
    <div className="content-card"><div className="section-heading"><div><h2>Registered users <span className="count-bubble">{users.length}</span></h2><p>Use a user's name and membership ID on the sign-in screen.</p></div></div>
      {!users.length?<Empty text="No users registered yet."/>:<div className="table-wrap"><table><thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><div className="member-cell"><div className="avatar">{u.name.charAt(0).toUpperCase()}</div><strong>{u.name}</strong></div></td><td>{u.membershipId}</td><td><span className="genre-tag">{u.role}</span></td><td><div className="action-group"><button className="small-button" onClick={()=>edit(u)}>Update</button><button className="small-button danger" onClick={()=>remove(u)}>Delete</button></div></td></tr>)}</tbody></table></div>}
    </div>
    <div className="notice"><strong>Demo login:</strong> Library Admin / ADMIN001. This student project uses browser storage and a demonstration sign-in; it is not production-grade authentication.</div>
  </section>;
}
export default function App() {
  const [books,setBooks]=useSavedState("community-library-books",starterBooks);
  const [users,setUsers]=useSavedState("community-library-users",starterUsers);
  const [transactions,setTransactions]=useSavedState("community-library-transactions",[]);
  const [currentUser,setCurrentUser]=useSavedState("community-library-current-user",null);
  const navigate=useNavigate();
  const logout=()=>{setCurrentUser(null);navigate("/login");};
  if(!currentUser) return <Routes><Route path="*" element={<Login users={users} onLogin={u=>{setCurrentUser(u);navigate("/");}}/>}/></Routes>;
  return <Layout currentUser={currentUser} onLogout={logout}><Routes>
    <Route path="/" element={<Dashboard books={books} users={users} transactions={transactions}/>}/>
    <Route path="/books" element={<Books books={books} setBooks={setBooks}/>}/>
    <Route path="/transactions" element={<Transactions books={books} setBooks={setBooks} transactions={transactions} setTransactions={setTransactions} users={users}/>}/>
    <Route path="/users" element={<Users users={users} setUsers={setUsers}/>}/>
    <Route path="*" element={<Dashboard books={books} users={users} transactions={transactions}/>}/>
  </Routes></Layout>;
}