self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = { title: "Ny besked", body: "", url: "/mit", tag: "default" };
  try { payload = { ...payload, ...event.data.json() }; } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/icon.png",
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/mit";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes("/mit") && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
