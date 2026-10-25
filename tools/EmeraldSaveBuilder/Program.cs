using PKHeX.Core;

if (args.Length != 2)
{
    Console.Error.WriteLine("Usage: EmeraldSaveBuilder <input.sav> <output.sav>");
    return 2;
}

const int SaveSize = 0x20000;
byte[] raw = File.ReadAllBytes(args[0]);
if (raw.Length < SaveSize)
    throw new InvalidDataException($"Base save too small: {raw.Length} bytes.");
if (raw.Length != SaveSize)
    Array.Resize(ref raw, SaveSize);

var sav = new SAV3E(raw);
if (string.IsNullOrWhiteSpace(sav.OT))
    sav.OT = "ELIE";
sav.Language = (int)LanguageID.French;

static PK3 MakePokemon(
    SAV3E sav,
    ushort species,
    string name,
    byte level,
    ushort m1,
    ushort m2,
    ushort m3,
    ushort m4,
    uint pid,
    GameVersion version = GameVersion.E,
    bool fateful = false)
{
    var pk = new PK3
    {
        Species = species,
        PID = pid,
        TID16 = sav.TID16,
        SID16 = sav.SID16,
        Language = (int)LanguageID.French,
        OriginalTrainerName = string.IsNullOrWhiteSpace(sav.OT) ? "ELIE" : sav.OT,
        OriginalTrainerGender = sav.Gender,
        Version = version,
        Ball = 4,
        MetLevel = 30,
        MetLocation = 0,
        OriginalTrainerFriendship = 100,
        FatefulEncounter = fateful,
        IV_HP = 25,
        IV_ATK = 25,
        IV_DEF = 25,
        IV_SPA = 25,
        IV_SPD = 25,
        IV_SPE = 25,
        Move1 = m1,
        Move2 = m2,
        Move3 = m3,
        Move4 = m4,
    };

    pk.Nickname = name;
    pk.CurrentLevel = level;
    pk.HealPP();
    pk.ResetPartyStats();
    pk.RefreshChecksum();
    return pk;
}

// Move IDs are Generation III move IDs.
var party = new PK3[]
{
    MakePokemon(sav, 260, "LAGGRON",   50, 57, 58, 89, 280, 0x1A2B3C41), // Surf, Ice Beam, Earthquake, Brick Break
    MakePokemon(sav, 282, "GARDEVOIR", 50, 94, 347, 85, 95, 0x2B3C4D52), // Psychic, Calm Mind, Thunderbolt, Hypnosis
    MakePokemon(sav, 310, "ÉLECSPRINT",50, 85, 44, 86, 98, 0x3C4D5E63), // Thunderbolt, Bite, Thunder Wave, Quick Attack
    MakePokemon(sav, 227, "AIRMURE",    50, 19, 211, 332, 92, 0x4D5E6F74), // Fly, Steel Wing, Aerial Ace, Toxic
    MakePokemon(sav, 286, "CHAPIGNON",  50, 327, 183, 202, 73, 0x5E6F7085), // Sky Uppercut, Mach Punch, Giga Drain, Leech Seed
    MakePokemon(sav, 323, "CAMÉRUPT",   50, 53, 89, 157, 241, 0x6F708196), // Flamethrower, Earthquake, Rock Slide, Sunny Day
};

for (int i = 0; i < party.Length; i++)
    sav.SetPartySlotAtIndex(party[i], i);

// First PC box: Mew + Charizard.
var mew = MakePokemon(sav, 151, "MEW", 50, 94, 57, 85, 58, 0x708192A7, GameVersion.E, true);
var charizard = MakePokemon(sav, 6, "DRACAUFEU", 50, 53, 19, 280, 163, 0x8192A3B8, GameVersion.FR);
sav.SetBoxSlotAtIndex(mew, 0, 0);
sav.SetBoxSlotAtIndex(charizard, 0, 1);

byte[] output = sav.Write().ToArray();
if (output.Length != SaveSize)
    throw new InvalidDataException($"Unexpected output save size: {output.Length}");

Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(args[1]))!);
File.WriteAllBytes(args[1], output);

// Re-open to verify the resulting save is internally readable.
var check = new SAV3E(output);
Console.WriteLine($"Trainer: {check.OT} / Language: {check.Language} / Party: {check.PartyCount}");
for (int i = 0; i < check.PartyCount; i++)
{
    var pk = check.GetPartySlotAtIndex(i);
    Console.WriteLine($"Party {i + 1}: {pk.Species} {pk.Nickname} Lv{pk.CurrentLevel} checksum={pk.ChecksumValid}");
}
for (int i = 0; i < 2; i++)
{
    var pk = check.GetBoxSlotAtIndex(0, i);
    Console.WriteLine($"Box 1 slot {i + 1}: {pk.Species} {pk.Nickname} Lv{pk.CurrentLevel} checksum={pk.ChecksumValid}");
}

if (check.PartyCount != 6)
    throw new InvalidDataException("Party count verification failed.");
if (check.GetBoxSlotAtIndex(0, 0).Species != 151 || check.GetBoxSlotAtIndex(0, 1).Species != 6)
    throw new InvalidDataException("PC Pokémon verification failed.");

return 0;
