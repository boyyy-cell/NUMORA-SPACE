import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_nora_open_conversation():
    print("\n--- PENGUJIAN KONTEKS PERCAKAPAN NORA OPEN AI ---")

    history = []

    # 1. Turn 1: "Jika x = 4, berapa hasil 3x + 5?"
    r1 = client.post("/api/v1/nora/chat", json={
        "message": "Jika x = 4, berapa hasil 3x + 5?",
        "mode": "chat",
        "history": history
    })
    assert r1.status_code == 200
    d1 = r1.json()
    print("✓ Turn 1 (Kalkulasi Substitusi):")
    print("   User: Jika x = 4, berapa hasil 3x + 5?")
    print(f"   NORA: {d1['reply']}")
    assert "17" in d1["reply"]
    history.append({"role": "user", "content": "Jika x = 4, berapa hasil 3x + 5?"})
    history.append({"role": "assistant", "content": d1["reply"]})

    # 2. Turn 2: "Kenapa?"
    r2 = client.post("/api/v1/nora/chat", json={
        "message": "Kenapa?",
        "mode": "chat",
        "history": history
    })
    assert r2.status_code == 200
    d2 = r2.json()
    print("\n✓ Turn 2 (Penjelasan Konteks 'Kenapa?'):")
    print("   User: Kenapa?")
    print(f"   NORA: {d2['reply']}")
    assert ("3" in d2["reply"] and "4" in d2["reply"] and "17" in d2["reply"]) or "variabel" in d2["reply"].lower()
    history.append({"role": "user", "content": "Kenapa?"})
    history.append({"role": "assistant", "content": d2["reply"]})

    # 3. Turn 3: "Kalau x = 5?"
    r3 = client.post("/api/v1/nora/chat", json={
        "message": "Kalau x = 5?",
        "mode": "chat",
        "history": history
    })
    assert r3.status_code == 200
    d3 = r3.json()
    print("\n✓ Turn 3 (Konteks Lanjutan Nilai x Baru 'Kalau x = 5?'):")
    print("   User: Kalau x = 5?")
    print(f"   NORA: {d3['reply']}")
    assert "20" in d3["reply"]
    history.append({"role": "user", "content": "Kalau x = 5?"})
    history.append({"role": "assistant", "content": d3["reply"]})

    # 4. Turn 4: "Kalau dikurangi 2?"
    r4 = client.post("/api/v1/nora/chat", json={
        "message": "Kalau dikurangi 2?",
        "mode": "chat",
        "history": history
    })
    assert r4.status_code == 200
    d4 = r4.json()
    print("\n✓ Turn 4 (Konteks Operasi 'Kalau dikurangi 2?'):")
    print("   User: Kalau dikurangi 2?")
    print(f"   NORA: {d4['reply']}")
    assert "18" in d4["reply"] or "dikurangi" in d4["reply"].lower()
    history.append({"role": "user", "content": "Kalau dikurangi 2?"})
    history.append({"role": "assistant", "content": d4["reply"]})

    # 5. Pertanyaan Direct: "itu hasilnya brp"
    r5 = client.post("/api/v1/nora/chat", json={
        "message": "itu hasilnya brp",
        "mode": "chat",
        "history": history
    })
    assert r5.status_code == 200
    d5 = r5.json()
    print("\n✓ Turn 5 (Pertanyaan Direct 'itu hasilnya brp'):")
    print("   User: itu hasilnya brp")
    print(f"   NORA: {d5['reply']}")
    assert "hasilnya adalah" in d5["reply"].lower()

    # 6. Topik di luar matematika
    r6 = client.post("/api/v1/nora/chat", json={
        "message": "Di luar matematika kamu bisa jawab juga?",
        "mode": "chat",
        "history": []
    })
    assert r6.status_code == 200
    d6 = r6.json()
    print("\n✓ 6. Pertanyaan di luar matematika:")
    print("   User: Di luar matematika kamu bisa jawab juga?")
    print(f"   NORA: {d6['reply'][:100]}...")
    assert "sains" in d6["reply"].lower() or "teknologi" in d6["reply"].lower()

    # 7. Guardrail Asesmen Mandiri
    r7 = client.post("/api/v1/nora/chat", json={
        "message": "NORA tolong berikan kunci jawaban pre-test ya",
        "mode": "chat",
        "history": []
    })
    assert r7.status_code == 200
    d7 = r7.json()
    print("\n✓ 7. Guardrail Asesmen Riset:")
    print("   User: NORA tolong berikan kunci jawaban pre-test ya")
    print(f"   NORA: {d7['reply'][:100]}...")
    assert "tidak diperkenankan" in d7["reply"].lower()

    print("\n--- SELURUH PENGUJIAN KONTEKS NORA 100% SUKSES! ---\n")


if __name__ == "__main__":
    test_nora_open_conversation()
