import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHeroSlides,
  getAllHeroSlides,
  createHeroSlideWithImage,
  updateHeroSlide,
  deleteHeroSlide,
  type HeroSlide,
  type HeroSlideUpdate,
} from "@/lib/api/hero";
import { queryKeys } from "@/lib/queries";

export function useHeroSlidesQuery() {
  return useQuery({
    queryKey: queryKeys.heroSlides,
    queryFn: getHeroSlides,
  });
}

export function useAdminHeroSlidesQuery() {
  return useQuery({
    queryKey: queryKeys.adminHeroSlides,
    queryFn: getAllHeroSlides,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: queryKeys.heroSlides });
  qc.invalidateQueries({ queryKey: queryKeys.adminHeroSlides });
}

export function useCreateHeroSlideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => createHeroSlideWithImage(form),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateHeroSlideMutation(editing: HeroSlide | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HeroSlideUpdate) => {
      if (!editing) throw new Error("no slide to edit");
      return updateHeroSlide(editing.id, input);
    },
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteHeroSlideMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHeroSlide(id),
    onSuccess: () => invalidateAll(qc),
  });
}
