<template>
  <div>
    <nav class="navbar">
      <span class="brand">🎓 AsisteProf</span>
      <div class="links">
        <NuxtLink to="/">Dashboard</NuxtLink>
        <NuxtLink to="/grupos">Grupos</NuxtLink>
      </div>
    </nav>
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; background: #f4f6f9; color: #333; }

.navbar {
  background: #2c3e50;
  color: white;
  padding: 14px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand { font-size: 20px; font-weight: bold; }
.links { display: flex; gap: 20px; }
.links a { color: #ccc; text-decoration: none; font-size: 15px; }
.links a:hover, .links a.router-link-active { color: white; }

.main { max-width: 900px; margin: 30px auto; padding: 0 20px; }

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn-primary { background: #2c3e50; color: white; }
.btn-danger { background: #e74c3c; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn-secondary { background: #95a5a6; color: white; }

input, select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
}
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
th { background: #f8f9fa; font-weight: 600; }
</style>