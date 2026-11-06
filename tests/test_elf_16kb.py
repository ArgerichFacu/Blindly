"""Casos de la guía Android y regresiones del auditor de ELF64/16 KB."""
import importlib.util
import struct
import sys
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location(
    "elf16kb", Path(__file__).resolve().parents[1] / "scripts/verificar-elf-16kb.py"
)
elf16kb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(elf16kb)


def load(start, size, *, offset=None, alignment=0x4000, flags=6, filesz=None):
    return (1, flags, start if offset is None else offset, start, start,
            size if filesz is None else filesz, size, alignment)


def relro(start, size):
    return (0x6474E552, 4, start, start, start, size, size, 1)


def audit(*segments):
    ident = b"\x7fELF\x02\x01\x01" + bytes(9)
    header = struct.pack("<16sHHIQQQIHHHHHH", ident, 3, 183, 1, 0,
                         64, 0, 0, 64, 56, len(segments), 0, 0, 0)
    return elf16kb.comprobar(header + b"".join(
        struct.pack("<IIQQQQQQ", *segment) for segment in segments))


class Elf16KbTests(unittest.TestCase):
    def test_android_example_1_shared_trailing_writable_page_fails(self):
        result = audit(load(0xDFAF0, 0x4510), relro(0xDFAF0, 0x1510))
        self.assertTrue(result["pt_load_ok"])
        self.assertFalse(result["compatible"])
        self.assertTrue(result["writable_loads_overlapping_rounded_relro"])

    def test_android_example_2_aligned_end_passes(self):
        self.assertTrue(audit(load(0xDFAF0, 0x3510),
                              relro(0xDFAF0, 0x510))["compatible"])

    def test_android_example_3_no_relro_passes(self):
        self.assertTrue(audit(load(0, 0x680, flags=5),
                              load(0x4680, 0x1D8))["compatible"])

    def test_android_example_4_own_load_unaligned_end_passes(self):
        result = audit(load(0, 0x680, flags=5), load(0x4680, 0x980),
                       relro(0x4680, 0x980))
        self.assertEqual(result["relro_end_remainders"], [0x1000])
        self.assertTrue(result["compatible"])

    def test_next_writable_load_on_next_page_passes(self):
        self.assertTrue(audit(load(0x4000, 0x1000), relro(0x4000, 0x1000),
                              load(0x8000, 0x1000))["compatible"])

    def test_lld_relro_includes_safe_page_padding(self):
        # Forma real de AndroidX: RELRO 0x5c40..0x6000; su LOAD termina
        # en 0x5fd0 y el siguiente dato escribible comienza en 0x9fd0.
        self.assertTrue(audit(load(0x5C40, 0x390, offset=0x1C40),
                              relro(0x5C40, 0x3C0),
                              load(0x9FD0, 0x10, offset=0x1FD0,
                                   filesz=0))["compatible"])

    def test_other_writable_load_on_trailing_page_fails(self):
        self.assertFalse(audit(load(0x4000, 0x1000), relro(0x4000, 0x1000),
                               load(0x6000, 0x1000))["compatible"])

    def test_writable_prefix_on_rounded_first_page_fails(self):
        result = audit(load(0x4000, 0x4000), relro(0x5000, 0x3000))
        self.assertFalse(result["compatible"])
        self.assertTrue(result["writable_loads_overlapping_relro_prefix"])

    def test_relro_outside_load_fails(self):
        self.assertFalse(audit(load(0, 0x1000),
                               relro(0x4000, 0x1000))["compatible"])

    def test_4kb_load_fails(self):
        self.assertFalse(audit(load(0, 0x1000, alignment=4096))["pt_load_ok"])

    def test_non_power_of_two_alignment_fails(self):
        self.assertFalse(audit(load(0, 0x1000, alignment=24576))["pt_load_ok"])

    def test_incongruent_load_file_offset_fails(self):
        self.assertFalse(audit(load(0x4000, 0x1000, offset=0x1000))["pt_load_ok"])

    def test_file_size_larger_than_memory_fails(self):
        self.assertFalse(audit(load(0, 0x1000, filesz=0x2000))["compatible"])

    def test_empty_program_headers_fail(self):
        self.assertFalse(audit()["compatible"])

    def test_truncated_header_rejected(self):
        with self.assertRaises(ValueError):
            elf16kb.comprobar(b"\x7fELF\x02\x01")


if __name__ == "__main__":
    unittest.main()
