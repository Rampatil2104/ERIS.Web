import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "";

// tiny helper
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
};
const fmtDate = (v) => (v ? String(v).slice(0, 10) : "");
const val = (v) => (v ?? v === 0 ? v : "");
const asBool = (v) => !!Number(v); // handles 0/1 and booleans

// simple field wrappers
const Readonly = ({ label, value, col = "col-md-3" }) => (
  <div className={col + " mb-3"}>
    <label className="form-label fw-semibold">{label}</label>
    <input className="form-control" value={val(value)} readOnly />
  </div>
);

const ReadonlyDate = ({ label, value, col = "col-md-3" }) => (
  <Readonly label={label} value={fmtDate(value)} col={col} />
);

const DisabledCheck = ({ label, checked, col = "col-md-3" }) => (
  <div className={col + " form-check mb-2"}>
    <input className="form-check-input" type="checkbox" checked={!!checked} disabled />
    <label className="form-check-label ms-1">{label}</label>
  </div>
);

export default function Details() {
  const { id } = useParams(); // /Details/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [details, setDetails] = useState(null);
  const [photos, setPhotos] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, dRows, ph] = await Promise.all([
        fetchJSON(`${API_BASE}/api/AssessmentProfile/${id}`),
        fetchJSON(`${API_BASE}/api/AssessmentDetails?assessmentId=${id}`),
        fetchJSON(`${API_BASE}/api/Photo?assessmentId=${id}`).catch(() => []),
      ]);
      setProfile(p || null);
      setDetails(dRows?.[0] || null);
      setPhotos(Array.isArray(ph) ? ph : []);
    } catch (e) {
      console.error("Details load failed:", e);
      alert("Failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const title = useMemo(
    () => `GEOTECHNICAL INITIAL SITE ASSESSMENT`,
    []
  );

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">{title}</h5>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/Search")}>
              New Search
            </button>
            <button className="btn btn-primary" disabled>
              Edit
            </button>
          </div>
        </div>
        <div className="alert alert-info">Loading…</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">{title}</h5>
          <div>
            <button className="btn btn-outline-secondary me-2" onClick={() => navigate("/Search")}>
              New Search
            </button>
          </div>
        </div>
        <div className="alert alert-warning">No assessment profile found.</div>
      </div>
    );
  }

  const d = details || {}; // shorthand

  return (
    <div className="container py-4">
      {/* Header / Actions */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0">{title}</h5>
        <div className="d-flex">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate("/Search")}
          >
            New Search
          </button>
          <Link to={`/Edit/${profile.AssessmentID}`} className="btn btn-primary">
            Edit
          </Link>
        </div>
      </div>

      {/* Profile Block */}
      <div className="card mb-4">
        <div className="card-header bg-warning-subtle fw-semibold">
          GISA-001 (NEW 1/2022)
        </div>
        <div className="card-body">
          <div className="row">
            <ReadonlyDate label="Date" value={profile.Date} />
            <Readonly label="District" value={profile.District} />
            <Readonly label="County" value={profile.County} />
            <Readonly label="Route" value={profile.Route} />
            <Readonly label="Post Mile" value={profile.PostMile} />
            <Readonly label="EA" value={profile.EA} />
            <Readonly label="Project ID" value={profile.ProjectID} />
            <ReadonlyDate label="Date Incident" value={profile.DateIncidentReported} />

            <Readonly label="Latitude" value={profile.Latitude} />
            <Readonly label="Longitude" value={profile.Longitude} />

            <Readonly label="District Contact: Last Name" value={profile.DistrictContactLastName} />
            <Readonly label="District Contact: First Name" value={profile.DistrictContactFirstName} />
            <Readonly label="S Number" value={profile.SNumber} />

            <Readonly label="Last Name" value={profile.LastName} col="col-md-6" />
            <Readonly label="First Name" value={profile.FirstName} col="col-md-6" />

            <Readonly label="Phone" value={profile.DistrictContactPhone} />
            <Readonly label="Cell Phone" value={profile.DistrictContactCellPhone} />
            <Readonly label="Assessment Status" value={profile.AssessmentStatus} />
            <Readonly label="Notes" value={profile.Notes} col="col-md-12" />
          </div>
        </div>
      </div>

      {/* Incident Type / Distribution / Highway Status */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Incident Type:</h6>
              <DisabledCheck label="(Rock) Fall" checked={asBool(d.IsFall)} />
              <DisabledCheck label="Topple" checked={asBool(d.IsTopple)} />
              <DisabledCheck label="Slide" checked={asBool(d.IsSlide)} />
              <DisabledCheck label="Spread" checked={asBool(d.IsSpread)} />
              <DisabledCheck label="Flow" checked={asBool(d.IsFlow)} />
              <DisabledCheck label="Compound" checked={asBool(d.IsCompound)} />
              <DisabledCheck label="Erosion" checked={asBool(d.IsErosion)} />
              <DisabledCheck label="Surfacial Sloughing" checked={asBool(d.IsSurfacialSloughing)} />
              <DisabledCheck label="Scoured Toe" checked={asBool(d.IsScouredToe)} />
              <DisabledCheck label="Washout" checked={asBool(d.IsWashout)} />
            </div>

            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Distribution:</h6>
              <DisabledCheck label="Advancing" checked={asBool(d.IsAdvancing)} />
              <DisabledCheck label="Retrogressing" checked={asBool(d.IsRetrogressing)} />
              <DisabledCheck label="Enlarging" checked={asBool(d.IsEnlarging)} />
              <DisabledCheck label="Widening" checked={asBool(d.IsWidening)} />
              <DisabledCheck label="Moving" checked={asBool(d.IsMoving)} />
              <DisabledCheck label="Confined" checked={asBool(d.IsConfined)} />
            </div>

            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Highway Status:</h6>
              <DisabledCheck label="Open" checked={asBool(d.IsHighwayOpen)} />
              <DisabledCheck label="Shoulder Closed" checked={asBool(d.IsShoulderClosed)} />
              <DisabledCheck label="Lane(s) Closed" checked={asBool(d.IsLaneClosed)} />
              <Readonly label="Closed Lanes" value={d.ClosedLanes} />
              <DisabledCheck label="One-way Closed" checked={asBool(d.IsOneWayClosed)} />
              <DisabledCheck label="Two-way Closed" checked={asBool(d.IsTwoWayClosed)} />
            </div>
          </div>
        </div>
      </div>

      {/* Materials / Soil & Vegetation / Dimensions */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Material:</h6>
              <DisabledCheck label="Rock" checked={asBool(d.IsRock)} />
              <DisabledCheck label="Has Bedding" checked={asBool(d.HasBedding)} />
              <DisabledCheck label="Has Joints" checked={asBool(d.HasJoints)} />
              <DisabledCheck label="Has Fractures" checked={asBool(d.HasFractures)} />
              <DisabledCheck label="Soil" checked={asBool(d.IsSoil)} />
              <Readonly label="Clay Estimate (%)" value={d.ClayEstimate} />
              <Readonly label="Silt Estimate (%)" value={d.SiltEstimate} />
              <Readonly label="Sand Estimate (%)" value={d.SandEstimate} />
              <Readonly label="Gravel Estimate (%)" value={d.GravelEstimate} />
            </div>

            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Vegetation Coverage (Slope):</h6>
              <Readonly label="Bushes/Shrubs (%)" value={d.BushesShrubsCoverageOnSlope} />
              <Readonly label="Trees (%)" value={d.TreesCoverageOnSlope} />
              <Readonly label="Ground Cover (%)" value={d.GroundCoverCoverageOnSlope} />

              <h6 className="fw-semibold mt-3 mb-2">Dimensions:</h6>
              <Readonly label="Slope Height" value={d.SlopeHeight} />
              <Readonly label="Original Slope" value={d.OriginalSlope} />
              <Readonly label="Landslide Width" value={d.LandslideWidth} />
              <Readonly label="Landslide Length" value={d.LandslideLength} />
              <Readonly label="Main Scarp Height" value={d.MainScarpHeight} />
              <Readonly label="Landslide Slope" value={d.LandslideSlope} />
            </div>

            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Pavement / Ground:</h6>
              <DisabledCheck label="Pavement/Ground Cracks" checked={asBool(d.IsPavementGroundCracks)} />
              <Readonly label="Crack Length (ft)" value={d.CrackLength} />
              <Readonly label="Crack Horizontal Disp. (in)" value={d.CrackHorizontalDisplacement} />
              <Readonly label="Crack Vertical Disp. (in)" value={d.CrackVerticalDisplacement} />
              <Readonly label="Crack Depth (in)" value={d.CrackDepth} />
              <Readonly label="Crack Settlement (in)" value={d.CrackSettlement} />
              <Readonly label="Bulge (in)" value={d.CrackBulge} />
              <DisabledCheck label="Indented by Rocks" checked={asBool(d.IsIndentedByRocks)} />
            </div>
          </div>
        </div>
      </div>

      {/* Encroachment / Hydrology */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <h6 className="fw-semibold mb-2">Roadway Encroachment:</h6>
              <Readonly label="Length" value={d.RoadwayEncroachedLength} />
              <Readonly label="Width" value={d.RoadwayEncroachedWidth} />
            </div>

            <div className="col-md-8">
              <h6 className="fw-semibold mb-2">Hydrology / Drainage:</h6>
              <DisabledCheck label="Dry" checked={asBool(d.IsDry)} />
              <DisabledCheck label="Moist" checked={asBool(d.IsMoist)} />
              <DisabledCheck label="Wet" checked={asBool(d.IsWet)} />
              <DisabledCheck label="Flowing Water" checked={asBool(d.IsFlowingWater)} />
              <DisabledCheck label="Seep" checked={asBool(d.IsSeep)} />
              <DisabledCheck label="Spring" checked={asBool(d.IsSpring)} />

              <DisabledCheck label="Clogged Inlet" checked={asBool(d.HasCloggedInlet)} />
              <DisabledCheck label="Compromised Drains" checked={asBool(d.HasCompromisedDrains)} />
              <DisabledCheck label="Surface Runoff" checked={asBool(d.HasSurfaceRunoff)} />
              <DisabledCheck label="Torrent Surge/Flood" checked={asBool(d.HasTorrentSurgeFlood)} />
            </div>
          </div>
        </div>
      </div>

      {/* Impacts */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <h6 className="fw-semibold mb-2">Impacted Adjacent (Confirmed):</h6>
              <DisabledCheck label="Utilities" checked={asBool(d.HasImpactedAdjacentUtilities)} />
              <DisabledCheck label="Properties" checked={asBool(d.HasImpactedAdjacentProperties)} />
              <DisabledCheck label="Structures" checked={asBool(d.HasImpactedAdjacentStructures)} />
            </div>
            <div className="col-md-6">
              <h6 className="fw-semibold mb-2">Impacted Adjacent (Maybe):</h6>
              <DisabledCheck label="Utilities" checked={asBool(d.HasMaybeImpactedAdjacentUtilities)} />
              <DisabledCheck label="Properties" checked={asBool(d.HasMaybeImpactedAdjacentProperties)} />
              <DisabledCheck label="Structures" checked={asBool(d.HasMaybeImpactedAdjacentStructures)} />
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="fw-semibold mb-2">Immediate Actions:</h6>
          <div className="row">
            <DisabledCheck label="Open Highway to Traffic" checked={asBool(d.IsImmediateActionOpenHighwayTraffic)} />
            <DisabledCheck label="Open Highway Shoulder" checked={asBool(d.IsImmediateActionOpenHighwayShoulder)} />
            <DisabledCheck label="Close Highway (One Direction)" checked={asBool(d.IsImmediateActionCloseHighwayOneDirection)} />
            <DisabledCheck label="Close Highway (Both Directions)" checked={asBool(d.IsImmediateActionCloseHighWayBothDirections)} />
            <DisabledCheck label="Remove Landslide Debris" checked={asBool(d.IsImmediateActionRemoveLandslideDebris)} />
            <DisabledCheck label="Place K-Rail or Fence" checked={asBool(d.IsImmediateActionPlaceKRailOrFence)} />
            <DisabledCheck label="Cover Slope with Plastic" checked={asBool(d.IsImmediateActionCoverSlopeWithPlastic)} />
            <DisabledCheck label="Divert Surface Water Runoff" checked={asBool(d.IsImmediateActionDivertSurfaceWaterRunoff)} />
            <DisabledCheck label="Remove Culvert Blockage" checked={asBool(d.IsImmediateActionRemoveCulvertBlockage)} />
            <DisabledCheck label="Dewater with Pump/Trench" checked={asBool(d.IsImmediateActionDewaterWithPumpTrench)} />
            <DisabledCheck label="Dewater with Horizontal Drains" checked={asBool(d.IsImmediateActionDewaterWithHorizontalDrains)} />
            <DisabledCheck label="Construct Temporary Shoring" checked={asBool(d.IsImmediateActionConstructTemporaryShoring)} />
            <DisabledCheck label="Buttress Toe of Landslide" checked={asBool(d.IsImmediateActionButtressToeOfLandslide)} />
            <DisabledCheck label="Place Rock Slope Protection" checked={asBool(d.IsImmediateActionPlaceRockSlopeProtection)} />
            <DisabledCheck label="Routine Visual Monitor" checked={asBool(d.IsImmediateActionRoutineVisualMonitor)} />
            <DisabledCheck label="Reconstruct Slope to Original Condition" checked={asBool(d.IsImmediateActionReconstructSlopeToOriginalCondition)} />
            <DisabledCheck label="Reconstruct Slope with Geosynthetics" checked={asBool(d.IsImmediateActionReconstructSlopeWithGeosynthetics)} />
          </div>
        </div>
      </div>

      {/* Follow Up Actions */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="fw-semibold mb-2">Follow Up Actions:</h6>
          <div className="row">
            <DisabledCheck label="Open Highway to Traffic" checked={asBool(d.IsFollowUpActionOpenHighwayTraffic)} />
            <DisabledCheck label="Open Highway Shoulder" checked={asBool(d.IsFollowUpActionOpenHighwayShoulder)} />
            <DisabledCheck label="Dewater with Horizontal Drains" checked={asBool(d.IsFollowUpActionDewaterWithHorizontalDrains)} />
            <DisabledCheck label="Construct Temporary Shoring" checked={asBool(d.IsFollowUpActionConstructTemporaryShoring)} />
            <DisabledCheck label="Buttress Toe of Landslide" checked={asBool(d.IsFollowUpActionButtressToeOfLandslide)} />
            <DisabledCheck label="Place Rock Slope Protection" checked={asBool(d.IsFollowUpActionPlaceRockSlopeProtection)} />
            <DisabledCheck label="Routine Visual Monitor" checked={asBool(d.IsFollowUpActionRoutineVisualMonitor)} />
            <DisabledCheck label="Reconstruct Slope to Original Condition" checked={asBool(d.IsFollowUpActionReconstructSlopeToOriginalCondition)} />
            <DisabledCheck label="Reconstruct Slope with Geosynthetics" checked={asBool(d.IsFollowUpActionReconstructSlopeWithGeosynthetics)} />
            <DisabledCheck label="Repair Culvert / Drainage Pipe" checked={asBool(d.IsFollowUpActionRepairCulvertDrainagePipe)} />
            <DisabledCheck label="Install Erosion Control" checked={asBool(d.IsFollowUpActionInstallErosionControl)} />
            <DisabledCheck label="Survey Site" checked={asBool(d.IsFollowUpActionSurveySite)} />
            <DisabledCheck label="Geological Mapping" checked={asBool(d.IsFollowUpActionGeologicalMapping)} />
            <DisabledCheck label="Subsurface Exploration" checked={asBool(d.IsFollowUpActionSubsurfaceExploration)} />
            <DisabledCheck label="Design and Plans" checked={asBool(d.IsFollowUpActionDesignAndPlans)} />
          </div>
          <div className="row">
            <Readonly label="Opened Lanes Count" value={d.OpenedLanesCount} />
          </div>
          <div className="row">
            <Readonly label="Observations and Notes" value={d.ObservationsAndNotes} col="col-md-12" />
          </div>
        </div>
      </div>

      {/* Photos (optional) */}
      {!!photos?.length && (
        <div className="card mb-5">
          <div className="card-body">
            <h6 className="fw-semibold mb-2">Photos</h6>
            <div className="row">
              {photos.map((p) => (
                <div key={p.PhotoID} className="col-md-4 mb-3">
                  <div className="border rounded p-2 h-100">
                    <div className="small text-muted">{p.AssociatedMeasurement || "Photo"}</div>
                    <div className="text-truncate">{p.FilePath}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
