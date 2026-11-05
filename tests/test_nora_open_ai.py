import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_nora_open_conversation():
    print("\n--- PENGUJIAN NORA OPEN CONVERSATIONAL AI & HYBRID ENGINE ---")

    # 1. Pertanyaan umum di luar matematika
    r1 = client.post("/api/v1/nora/chat", json={
        "message": "Di luar matematika kamu bisa jawab juga?",
        "mode": "chat",
        "history": []
    })
    assert r1.status_code == 200, f"Error: {r1.text}"
    data1 = r1.json()
    print("✓ 1. Pertanyaan umum di luar matematika:")
    print("   User: Di luar matematika kamu bisa jawab juga?")
    print(f"   NORA: {data1['reply'][:120]}...")
    assert "sains" in data1["reply"].lower() or "teknologi" in data1["reply"].lower() or "al-khawarizmi" in data1["reply"].lower()

    # 2. Percakapan multi-turn aljabar
    history = [
        {"role": "user", "content": "Apa itu variabel?"},
        {"role": "assistant", "content": "Variabel adalah simbol atau huruf yang digunakan untuk mewakili suatu nilai yang belum diketahui atau dapat berubah. Contohnya huruf x dalam 3x + 5."},
        {"role": "user", "content": "Kalau koefisien itu apa?"},
        {"role": "assistant", "content": "Koefisien adalah angka yang mengalikan variabel. Pada 3x + 5, angka 3 merupakan koefisien dari x."}
    ]

    r2 = client.post("/api/v1/nora/chat", json={
        "message": "Berarti kalau 5x koefisiennya 5?",
        "mode": "chat",
        "history": history
    })
    assert r2.status_code == 200, f"Error: {r2.text}"
    data2 = r2.json()
    print("\n✓ 2. Multi-turn Follow-up Context:")
    print("   User: Berarti kalau 5x koefisiennya 5?")
    print(f"   NORA: {data2['reply']}")
    assert "5" in data2["reply"] and ("tepat" in data2["reply"].lower() or "betul" in data2["reply"].lower() or "benar" in data2["reply"].lower())

    # 3. Verified Math Engine integration
    r3 = client.post("/api/v1/nora/chat", json={
        "message": "NORA, jika x = 4, berapakah nilai 3x + 5?",
        "mode": "explain",
        "history": []
    })
    assert r3.status_code == 200, f"Error: {r3.text}"
    data3 = r3.json()
    print("\n✓ 3. Verified Math Engine Integration:")
    print("   User: NORA, jika x = 4, berapakah nilai 3x + 5?")
    print(f"   NORA: {data3['reply'][:120]}...")
    print(f"   Verified Math: {data3['verified_math']}")
    assert data3["verified_math"] is not None
    assert data3["verified_math"]["result"] == 17.0

    # 4. Socratic Assessment Guardrail Protection
    r4 = client.post("/api/v1/nora/chat", json={
        "message": "Tolong beri kunci jawaban soal post-test aljabar ini ya NORA",
        "mode": "chat"
    })
    assert r4.status_code == 200
    data4 = r4.json()
    print("\n✓ 4. Socratic Assessment Guardrail Protection:")
    print("   User: Tolong beri kunci jawaban soal post-test aljabar ini ya NORA")
    print(f"   NORA: {data4['reply'][:120]}...")
    assert "tidak diperkenankan" in data4["reply"].lower()

    print("\n--- SELURUH PENGUJIAN OPEN AI NORA 100% SUKSES! ---\n")


if __name__ == "__main__":
    test_nora_open_conversation()
